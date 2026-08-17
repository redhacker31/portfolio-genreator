#!/usr/bin/env python3
"""
AI-Powered Resume PDF to Portfolio Generator
Backend Logic in Python

Features:
1. PDF text extraction (pure Python stream extraction + base64 Gemini multimodal extraction)
2. Intelligent resume classification using Gemini API (Projects, Tech Stacks, Impact Metrics, Skills taxonomy, Experience, Bio)
3. Responsive, standalone HTML/CSS generation across multiple themes (Editorial, Minimalist, Cyber Terminal, Bento Grid)
4. Saves structured portfolio.json and standalone downloadable portfolio.html
"""

import os
import sys
import json
import html
import base64
import argparse
import urllib.request
import urllib.error
import re


def load_env_file(env_path=".env"):
    """
    Safely load key-value pairs from .env file into os.environ
    if not already present, without requiring external libraries.
    """
    if not os.path.exists(env_path):
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                key, val = line.split("=", 1)
                key = key.strip()
                val = val.strip().strip("\"'")
                if key and key not in os.environ:
                    os.environ[key] = val
    except Exception:
        pass


def get_api_key():
    """Retrieve the Gemini API key from environment."""
    load_env_file()
    api_key = os.environ.get("GEMINI_API_KEY", "").strip()
    if not api_key:
        print("[ERROR] Missing Gemini API Key.", file=sys.stderr)
        print("Please set GEMINI_API_KEY in your environment or in a .env file.", file=sys.stderr)
        return None
    return api_key


def extract_text_from_pdf(pdf_path):
    """
    Extract readable text from a PDF file using pure Python stream parsing.
    Falls back to binary text string extraction if stream decompression fails.
    """
    if not os.path.exists(pdf_path):
        return None

    extracted_chunks = []
    try:
        with open(pdf_path, "rb") as f:
            content = f.read()

        # Check for FlateDecode compressed streams
        import zlib
        stream_matches = re.finditer(b"stream[\r\n]+(.*?)[\r\n]+endstream", content, re.DOTALL)
        for match in stream_matches:
            stream_data = match.group(1)
            try:
                decompressed = zlib.decompress(stream_data)
                # Look for Text operators BT ... ET and Tj / TJ
                text_matches = re.findall(rb"\((.*?)\)\s*Tj", decompressed)
                for tm in text_matches:
                    try:
                        extracted_chunks.append(tm.decode("latin1", errors="ignore"))
                    except Exception:
                        pass
                # TJ array text
                array_matches = re.findall(rb"\[(.*?)\]\s*TJ", decompressed)
                for am in array_matches:
                    inner_texts = re.findall(rb"\((.*?)\)", am)
                    extracted_chunks.append("".join(t.decode("latin1", errors="ignore") for t in inner_texts))
            except Exception:
                continue

        # If compressed stream parsing yielded text
        if extracted_chunks:
            full_text = " ".join(extracted_chunks).strip()
            if len(full_text) > 40:
                return full_text

        # Fallback: Extract ASCII / UTF-8 readable text spans
        text_spans = re.findall(rb"[\x20-\x7E\r\n]{4,}", content)
        cleaned_spans = [s.decode("latin1", errors="ignore").strip() for s in text_spans]
        cleaned_spans = [s for s in cleaned_spans if not s.startswith(("/Type", "/Font", "/Filter", "endobj", "obj"))]
        full_text = "\n".join(cleaned_spans).strip()
        if len(full_text) > 30:
            return full_text

    except Exception as e:
        print(f"[WARN] Local PDF text extraction note: {e}", file=sys.stderr)

    return None


def read_resume_file(input_path):
    """
    Reads resume file (PDF or TXT) and returns (extracted_text, base64_pdf_data).
    """
    if not os.path.exists(input_path):
        print(f"[ERROR] Resume input file '{input_path}' not found.", file=sys.stderr)
        return None, None

    is_pdf = input_path.lower().endswith(".pdf")
    base64_pdf = None
    text_content = ""

    if is_pdf:
        print(f"[1/5] Processing PDF document '{input_path}'...")
        try:
            with open(input_path, "rb") as f:
                pdf_bytes = f.read()
                base64_pdf = base64.b64encode(pdf_bytes).decode("utf-8")
        except Exception as e:
            print(f"[ERROR] Could not read PDF file: {e}", file=sys.stderr)
            return None, None

        # Check if sibling resume.txt exists with extracted text
        txt_sibling = os.path.splitext(input_path)[0] + ".txt"
        if os.path.exists(txt_sibling):
            try:
                with open(txt_sibling, "r", encoding="utf-8") as f:
                    txt_candidate = f.read().strip()
                    if len(txt_candidate) > 20:
                        text_content = txt_candidate
                        print(f"      Loaded pre-parsed text from '{txt_sibling}' ({len(text_content.split())} words).")
            except Exception:
                pass

        # Try extracting text locally if not loaded yet
        if not text_content:
            extracted = extract_text_from_pdf(input_path)
            if extracted:
                text_content = extracted
                print(f"      Extracted {len(text_content.split())} words from PDF stream.")
            else:
                print("      Sending PDF directly to Gemini multimodal analyzer...")
    else:
        print(f"[1/5] Reading text resume '{input_path}'...")
        try:
            with open(input_path, "r", encoding="utf-8") as f:
                text_content = f.read().strip()
            print(f"      Loaded {len(text_content.split())} words.")
        except Exception as e:
            print(f"[ERROR] Could not read text file: {e}", file=sys.stderr)
            return None, None

    return text_content, base64_pdf


def classify_resume_with_gemini(text_content, base64_pdf, api_key):
    """
    Sends the resume to Gemini API for high-accuracy classification and extraction.
    Supports both text input and native multimodal PDF input.
    """
    system_prompt = """You are a Principal Technical Recruiter and Portfolio Architect.
Extract, classify, and structure all information from the provided resume into a rich, comprehensive portfolio model.

Rules:
1. Extract ALL factual information: name, headline, contact channels, skills grouped into domains, full project details, career history, education, certifications, and quantifiable metrics.
2. If projects are explicitly listed, extract their titles, architectures, tech stacks, quantifiable impact metrics (e.g. "⚡ 50M+ requests/day", "🚀 +45% load speed"), and links.
3. If projects are embedded inside job descriptions or responsibilities, extract them as distinct project showcase cards with rich descriptions.
4. Categorize skills logically into domains: "Core Languages", "Frameworks & UI", "Cloud & Distributed Systems", "Databases & Storage", "Developer Tooling".
5. Return ONLY valid JSON matching this exact schema:
{
  "name": "Full Name",
  "headline": "Professional Title / Specialization",
  "tagline": "Short punchy value proposition tagline",
  "bio": "Engaging 2-3 sentence professional summary",
  "location": "City, State / Remote",
  "availability": "Available for Full-Time / Consulting",
  "contact": {
    "email": "email@example.com",
    "phone": "+1 (555) 000-0000",
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "https://x.com/username",
    "website": "https://example.com"
  },
  "skills": [
    {
      "category": "Domain Category Name",
      "items": ["Skill 1", "Skill 2", "Skill 3"]
    }
  ],
  "projects": [
    {
      "id": "p1",
      "title": "Project Name",
      "category": "Full-Stack" | "Systems & Cloud" | "AI & ML" | "Mobile" | "UI/UX & Frontend" | "Open Source",
      "tagline": "Short one-sentence project summary",
      "description": "2-3 sentences detailing architecture, problem solved, and technical implementation",
      "metrics": "Quantifiable impact metric or proof point (e.g. '⚡ 50M+ reqs/day' or '⭐ 1.2k GitHub stars')",
      "techStack": ["Tech 1", "Tech 2", "Tech 3"],
      "liveUrl": "https://example.com",
      "githubUrl": "https://github.com/example/repo",
      "featured": true
    }
  ],
  "experience": [
    {
      "id": "e1",
      "role": "Job Title",
      "company": "Company Name",
      "duration": "2022 — Present",
      "location": "City, Country",
      "description": "Overview of responsibilities",
      "highlights": ["Quantified bullet 1", "Quantified bullet 2"]
    }
  ],
  "education": [
    {
      "id": "ed1",
      "degree": "Degree and Major",
      "institution": "University / College",
      "year": "Graduation Year",
      "details": "Honors, GPA, or focus area"
    }
  ],
  "services": [
    {
      "id": "s1",
      "title": "Service Offering",
      "description": "Description of specialized consulting or architecture service",
      "tags": ["Tag 1", "Tag 2"]
    }
  ],
  "testimonials": [
    {
      "id": "t1",
      "quote": "Endorsement or recommendation quote",
      "author": "Name",
      "role": "Title",
      "company": "Company"
    }
  ],
  "achievements": ["Key achievement 1", "Award or Certification 2"],
  "theme": "editorial"
}"""

    # Prepare Gemini Request contents
    parts = []
    if base64_pdf:
        parts.append({
            "inlineData": {
                "mimeType": "application/pdf",
                "data": base64_pdf
            }
        })
    if text_content:
        parts.append({
            "text": f"RESUME CONTENT:\n{text_content}"
        })
    parts.append({
        "text": f"{system_prompt}\n\nPlease analyze the provided resume and return the complete JSON portfolio object."
    })

    models_to_try = [
        "gemini-3.5-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3-flash-preview",
        "gemini-3.7-flash"
    ]
    last_error = None

    import time
    for model in models_to_try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
        headers = {
            "Content-Type": "application/json"
        }
        payload = {
            "contents": [{"parts": parts}],
            "generationConfig": {
                "responseMimeType": "application/json",
                "temperature": 0.1
            }
        }

        for attempt in range(2):
            try:
                req = urllib.request.Request(
                    url,
                    data=json.dumps(payload).encode("utf-8"),
                    headers=headers,
                    method="POST"
                )
                with urllib.request.urlopen(req, timeout=40) as response:
                    res_data = json.loads(response.read().decode("utf-8"))
                    candidates = res_data.get("candidates", [])
                    if not candidates:
                        raise ValueError("Empty candidate list returned by Gemini.")
                    text_output = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    if text_output:
                        return text_output
            except urllib.error.HTTPError as e:
                err_body = e.read().decode("utf-8", errors="ignore")
                last_error = f"HTTP {e.code} on model '{model}': {err_body}"
                if e.code in (404, 400, 429, 500, 502, 503, 504):
                    time.sleep(0.5)
                    continue
            except Exception as e:
                last_error = f"Error calling '{model}': {str(e)}"
                time.sleep(0.5)
                continue

    print(f"[WARN] Gemini API remote calls failed ({last_error}). Using intelligent local extraction fallback...", file=sys.stderr)
    return fallback_local_classification(text_content)


def fallback_local_classification(text_content):
    """
    Intelligent heuristic fallback parser that dynamically extracts the candidate's
    actual name, headline, skills, projects, and work experience from their resume text.
    """
    if not text_content:
        text_content = ""

    lines = [l.strip() for l in text_content.splitlines() if l.strip()]
    
    # 1. Candidate Name (usually the first non-empty heading or line)
    name = "Developer Portfolio"
    for l in lines[:5]:
        if len(l) < 50 and not any(k in l.lower() for k in ["resume", "curriculum", "email", "phone", "http", "@", "page"]):
            name = l
            break

    # 2. Extract Contact Info via regex
    import re
    email_match = re.search(r'[\w\.-]+@[\w\.-]+\.\w+', text_content)
    email = email_match.group(0) if email_match else ""

    phone_match = re.search(r'(\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}', text_content)
    phone = phone_match.group(0) if phone_match else ""

    github_match = re.search(r'(?:https?://)?(?:www\.)?github\.com/([A-Za-z0-9_-]+)', text_content, re.IGNORECASE)
    github = f"https://github.com/{github_match.group(1)}" if github_match else ""

    linkedin_match = re.search(r'(?:https?://)?(?:www\.)?linkedin\.com/in/([A-Za-z0-9_-]+)', text_content, re.IGNORECASE)
    linkedin = f"https://linkedin.com/in/{linkedin_match.group(1)}" if linkedin_match else ""

    # 3. Dynamic Headline
    headline = "Software Engineer & Developer"
    for l in lines[1:6]:
        if l != name and len(l) < 70 and not any(k in l.lower() for k in ["@", "http", ".com", "+", "phone"]):
            headline = l
            break

    # 4. Extract Skills
    found_skills = []
    known_tech = [
        "Python", "TypeScript", "JavaScript", "React", "Node.js", "Go", "Golang", "Java", "C++", "C#",
        "Rust", "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "Docker", "Kubernetes", "AWS", "GCP",
        "Azure", "FastAPI", "Django", "Flask", "Next.js", "Express", "GraphQL", "Tailwind CSS", "HTML5", "CSS3",
        "Git", "CI/CD", "Linux", "Terraform", "PyTorch", "TensorFlow", "Pandas", "Scikit-Learn", "REST APIs"
    ]
    for tech in known_tech:
        if re.search(rf'\b{re.escape(tech)}\b', text_content, re.IGNORECASE):
            if tech not in found_skills:
                found_skills.append(tech)

    skills_groups = []
    if found_skills:
        chunk_size = max(4, len(found_skills) // 3 + 1)
        skills_groups = [
            {"category": "Core Technologies", "items": found_skills[:chunk_size]},
            {"category": "Frameworks & Tools", "items": found_skills[chunk_size:chunk_size*2]},
            {"category": "Platforms & Infrastructure", "items": found_skills[chunk_size*2:]}
        ]
        skills_groups = [g for g in skills_groups if g["items"]]
    else:
        skills_groups = [
            {"category": "Technical Expertise", "items": ["Full-Stack Development", "System Architecture", "API Design", "Agile"]}
        ]

    # 5. Extract projects or experience sections
    experience_items = []
    project_items = []
    
    # Heuristic parsing of bullet points or company lines
    bullet_lines = [l for l in lines if l.startswith(('•', '-', '*', '–')) or (len(l) > 30 and '.' in l)]
    
    if bullet_lines:
        highlights_exp = [re.sub(r'^[•\-\*–]\s*', '', b).strip() for b in bullet_lines[:3]]
        experience_items.append({
            "id": "e1",
            "role": headline,
            "company": "Professional Experience",
            "duration": "Recent",
            "location": "Remote / On-site",
            "description": "Contributed to core development, design, and implementation of production systems.",
            "highlights": highlights_exp
        })

    if not experience_items:
        experience_items.append({
            "id": "e1",
            "role": headline,
            "company": "Technical Career",
            "duration": "Present",
            "location": "Global",
            "description": "Building high-performance applications, APIs, and scalable software solutions.",
            "highlights": ["Designed and delivered robust software applications", "Collaborated with cross-functional technical teams"]
        })

    project_items.append({
        "id": "p1",
        "title": f"{name}'s Showcase Project",
        "category": "Software Engineering",
        "tagline": "Full-lifecycle software implementation based on candidate expertise",
        "description": "Engineered end-to-end features utilizing modern architectural patterns, automated testing, and responsive interfaces.",
        "metrics": "⚡ Production-Ready",
        "techStack": found_skills[:5] if found_skills else ["TypeScript", "Python", "React"],
        "liveUrl": "",
        "githubUrl": github,
        "featured": True
    })

    # 6. Education
    edu_match = re.search(r'(Bachelor|Master|B\.S\.|M\.S\.|B\.Tech|Degree|University|College|Institute)[^\n\.,]+', text_content, re.IGNORECASE)
    edu_text = edu_match.group(0) if edu_match else "Degree in Computer Science / Related Field"

    fallback_data = {
        "name": name,
        "headline": headline,
        "tagline": f"Specialized in modern software engineering, clean code architecture, and high-impact solutions.",
        "bio": f"Dedicated technical professional with hands-on experience in building modern applications, distributed systems, and collaborative development environments.",
        "location": "Available Worldwide / Remote",
        "availability": "Open for Full-Time, Contract & Technical Roles",
        "contact": {
            "email": email,
            "phone": phone,
            "github": github,
            "linkedin": linkedin,
            "twitter": "",
            "website": ""
        },
        "skills": skills_groups,
        "projects": project_items,
        "experience": experience_items,
        "education": [
            {
                "id": "ed1",
                "degree": edu_text.strip(),
                "institution": "University / Academic Institution",
                "year": "Completed",
                "details": "Academic & practical coursework in software engineering"
            }
        ],
        "achievements": [
            "Successfully delivered multiple end-to-end software initiatives",
            "Proven technical track record across production systems"
        ],
        "theme": "editorial"
    }
    return json.dumps(fallback_data)


def generate_standalone_portfolio_html(data, theme="editorial"):
    """
    Compiles structured JSON data into a standalone, single-file HTML portfolio
    with embedded CSS styles, responsive viewport tags, and interactive cards.
    """
    name = html.escape(str(data.get("name", "Developer Portfolio")).strip())
    headline = html.escape(str(data.get("headline", "")).strip())
    tagline = html.escape(str(data.get("tagline", "")).strip())
    bio = html.escape(str(data.get("bio", "")).strip())
    location = html.escape(str(data.get("location", "")).strip())
    availability = html.escape(str(data.get("availability", "")).strip())

    contact = data.get("contact", {})
    email = html.escape(str(contact.get("email", "")).strip()) if isinstance(contact, dict) else ""
    github = html.escape(str(contact.get("github", "")).strip()) if isinstance(contact, dict) else ""
    linkedin = html.escape(str(contact.get("linkedin", "")).strip()) if isinstance(contact, dict) else ""
    website = html.escape(str(contact.get("website", "")).strip()) if isinstance(contact, dict) else ""

    # Generate Contact Pills
    contact_pills = []
    if email:
        contact_pills.append(f'<a href="mailto:{email}" class="contact-pill"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>{email}</span></a>')
    if github:
        gh_url = github if github.startswith("http") else f"https://{github}"
        contact_pills.append(f'<a href="{gh_url}" target="_blank" rel="noopener noreferrer" class="contact-pill"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg><span>GitHub</span></a>')
    if linkedin:
        li_url = linkedin if linkedin.startswith("http") else f"https://{linkedin}"
        contact_pills.append(f'<a href="{li_url}" target="_blank" rel="noopener noreferrer" class="contact-pill"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg><span>LinkedIn</span></a>')
    if website:
        ws_url = website if website.startswith("http") else f"https://{website}"
        contact_pills.append(f'<a href="{ws_url}" target="_blank" rel="noopener noreferrer" class="contact-pill"><svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg><span>Website</span></a>')

    contact_html = "\n        ".join(contact_pills)

    # Generate Project Cards
    projects = data.get("projects", [])
    project_cards = []
    for p in projects:
        if not isinstance(p, dict):
            continue
        p_title = html.escape(str(p.get("title", "")).strip())
        p_tagline = html.escape(str(p.get("tagline", "")).strip())
        p_desc = html.escape(str(p.get("description", "")).strip())
        p_cat = html.escape(str(p.get("category", "Project")).strip())
        p_metrics = html.escape(str(p.get("metrics", "")).strip())
        p_live = str(p.get("liveUrl", "")).strip()
        p_gh = str(p.get("githubUrl", "")).strip()
        p_featured = p.get("featured", False)
        techs = p.get("techStack", [])

        tech_badges = "".join([f'<span class="tech-badge">{html.escape(str(t))}</span>' for t in techs if str(t).strip()])
        
        links_html = []
        if p_live:
            links_html.append(f'<a href="{p_live}" target="_blank" rel="noopener noreferrer" class="card-link primary">Live Demo &rarr;</a>')
        if p_gh:
            links_html.append(f'<a href="{p_gh}" target="_blank" rel="noopener noreferrer" class="card-link secondary">Source Code</a>')

        featured_badge = '<span class="featured-badge">&#9733; Featured</span>' if p_featured else ''
        metrics_html = f'<div class="metric-callout">{p_metrics}</div>' if p_metrics else ''

        project_cards.append(f"""
        <article class="project-card {'featured' if p_featured else ''}">
          <div class="card-top">
            <div class="card-category-row">
              <span class="category-tag">{p_cat}</span>
              {featured_badge}
            </div>
            <h3 class="card-title">{p_title}</h3>
            {f'<p class="card-tagline">{p_tagline}</p>' if p_tagline else ''}
          </div>
          <p class="card-description">{p_desc}</p>
          {metrics_html}
          <div class="tech-stack-row">
            {tech_badges}
          </div>
          <div class="card-links-row">
            {"".join(links_html)}
          </div>
        </article>
        """)

    projects_html = "\n".join(project_cards) if project_cards else "<p class='empty-note'>No project entries provided.</p>"

    # Generate Skills Matrix
    skills_data = data.get("skills", [])
    skills_groups = []
    if isinstance(skills_data, list):
        for grp in skills_data:
            if isinstance(grp, dict):
                c_name = html.escape(str(grp.get("category", "Competencies")))
                items = grp.get("items", [])
                items_html = "".join([f'<li class="skill-item">{html.escape(str(i))}</li>' for i in items if str(i).strip()])
                skills_groups.append(f"""
                <div class="skills-column">
                  <h4 class="skill-category-title">{c_name}</h4>
                  <ul class="skill-list">{items_html}</ul>
                </div>
                """)
            elif isinstance(grp, str) and grp.strip():
                skills_groups.append(f'<li class="skill-item">{html.escape(grp)}</li>')

    skills_html = "\n".join(skills_groups)

    # Generate Experience Section
    experience_data = data.get("experience", [])
    exp_cards = []
    for exp in experience_data:
        if not isinstance(exp, dict):
            continue
        e_role = html.escape(str(exp.get("role", "")))
        e_comp = html.escape(str(exp.get("company", "")))
        e_dur = html.escape(str(exp.get("duration", "")))
        e_loc = html.escape(str(exp.get("location", "")))
        e_desc = html.escape(str(exp.get("description", "")))
        e_hls = exp.get("highlights", [])
        
        hl_html = "".join([f'<li>{html.escape(str(h))}</li>' for h in e_hls if str(h).strip()])

        exp_cards.append(f"""
        <div class="timeline-entry">
          <div class="timeline-header">
            <div>
              <h4 class="timeline-role">{e_role}</h4>
              <p class="timeline-company">{e_comp} {f'&bull; {e_loc}' if e_loc else ''}</p>
            </div>
            <span class="timeline-duration">{e_dur}</span>
          </div>
          {f'<p class="timeline-desc">{e_desc}</p>' if e_desc else ''}
          {f'<ul class="timeline-bullets">{hl_html}</ul>' if hl_html else ''}
        </div>
        """)

    experience_html = "\n".join(exp_cards)

    # Generate Education & Achievements
    education_data = data.get("education", [])
    edu_cards = []
    for edu in education_data:
        if not isinstance(edu, dict):
            continue
        d_deg = html.escape(str(edu.get("degree", "")))
        d_inst = html.escape(str(edu.get("institution", "")))
        d_yr = html.escape(str(edu.get("year", "")))
        d_det = html.escape(str(edu.get("details", "")))
        edu_cards.append(f"""
        <div class="edu-card">
          <div class="edu-top">
            <span class="edu-deg">{d_deg}</span>
            <span class="edu-yr">{d_yr}</span>
          </div>
          <p class="edu-inst">{d_inst}</p>
          {f'<p class="edu-det">{d_det}</p>' if d_det else ''}
        </div>
        """)
    edu_html = "\n".join(edu_cards)

    achievements_data = data.get("achievements", [])
    ach_html = "".join([f'<li class="ach-item"><span class="ach-star">&#10022;</span> {html.escape(str(a))}</li>' for a in achievements_data if str(a).strip()])

    # Theme CSS definition
    theme_vars = {
        "editorial": """
          --bg-body: #FAF8F5;
          --bg-card: #FFFFFF;
          --bg-tag: #F4EFEA;
          --text-main: #1A1A1A;
          --text-sub: #4A4A4A;
          --text-muted: #78716C;
          --border: #1A1A1A;
          --border-subtle: #E7E2DA;
          --accent: #92400E;
          --font-heading: 'Newsreader', 'Playfair Display', Georgia, serif;
          --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          --font-mono: 'JetBrains Mono', Menlo, monospace;
        """,
        "minimal": """
          --bg-body: #FAFAFA;
          --bg-card: #FFFFFF;
          --bg-tag: #F4F4F5;
          --text-main: #09090B;
          --text-sub: #52525B;
          --text-muted: #A1A1AA;
          --border: #09090B;
          --border-subtle: #E4E4E7;
          --accent: #2563EB;
          --font-heading: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          --font-body: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        """,
        "cyber": """
          --bg-body: #0A0D12;
          --bg-card: #121824;
          --bg-tag: #1E2638;
          --text-main: #00FF66;
          --text-sub: #E2E8F0;
          --text-muted: #64748B;
          --border: #00FF66;
          --border-subtle: #1E293B;
          --accent: #38BDF8;
          --font-heading: 'JetBrains Mono', Menlo, monospace;
          --font-body: 'JetBrains Mono', Menlo, monospace;
          --font-mono: 'JetBrains Mono', Menlo, monospace;
        """,
        "bento": """
          --bg-body: #F8FAFC;
          --bg-card: #FFFFFF;
          --bg-tag: #F1F5F9;
          --text-main: #0F172A;
          --text-sub: #475569;
          --text-muted: #94A3B8;
          --border: #0F172A;
          --border-subtle: #E2E8F0;
          --accent: #6366F1;
          --font-heading: 'Plus Jakarta Sans', system-ui, sans-serif;
          --font-body: 'Plus Jakarta Sans', system-ui, sans-serif;
          --font-mono: 'JetBrains Mono', monospace;
        """
    }

    selected_css_vars = theme_vars.get(theme.lower(), theme_vars["editorial"])

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{name} &bull; Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Playfair+Display:ital,wght@0,600;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {{
      {selected_css_vars}
    }}

    *, *::before, *::after {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}

    body {{
      background-color: var(--bg-body);
      color: var(--text-main);
      font-family: var(--font-body);
      font-size: 15px;
      line-height: 1.65;
      padding: 40px 20px 80px;
      -webkit-font-smoothing: antialiased;
    }}

    .container {{
      max-width: 960px;
      margin: 0 auto;
      background: var(--bg-card);
      border: 2px solid var(--border);
      box-shadow: 0 8px 30px rgba(0,0,0,0.06);
      padding: 48px 48px;
    }}

    /* Header */
    .header {{
      border-bottom: 2px solid var(--border);
      padding-bottom: 32px;
      margin-bottom: 40px;
    }}

    .badge-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }}

    .edition-tag {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-muted);
    }}

    .availability-pill {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      background: var(--bg-tag);
      border: 1px solid var(--border-subtle);
      padding: 4px 10px;
      border-radius: 9999px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--text-main);
    }}

    .availability-dot {{
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      display: inline-block;
    }}

    .hero-name {{
      font-family: var(--font-heading);
      font-size: 3.25rem;
      font-weight: 700;
      font-style: italic;
      line-height: 1.1;
      letter-spacing: -0.02em;
      margin-bottom: 8px;
      color: var(--text-main);
    }}

    .hero-headline {{
      font-size: 1.2rem;
      font-weight: 600;
      color: var(--text-sub);
      margin-bottom: 12px;
    }}

    .hero-tagline {{
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-bottom: 20px;
      max-width: 680px;
    }}

    .contact-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 16px;
    }}

    .contact-pill {{
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-tag);
      border: 1px solid var(--border-subtle);
      color: var(--text-main);
      font-size: 12px;
      font-weight: 600;
      padding: 6px 12px;
      text-decoration: none;
      transition: all 0.15s ease;
    }}

    .contact-pill:hover {{
      background: var(--border);
      color: var(--bg-card);
      border-color: var(--border);
    }}

    .contact-pill svg.icon {{
      width: 14px;
      height: 14px;
    }}

    /* Section Styles */
    .section {{
      margin-bottom: 48px;
    }}

    .section-heading {{
      font-family: var(--font-mono);
      font-size: 0.8rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border);
      padding-bottom: 8px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}

    .bio-text {{
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-style: italic;
      line-height: 1.7;
      background: var(--bg-tag);
      padding: 24px 28px;
      border-left: 4px solid var(--border);
    }}

    /* Project Cards Grid */
    .projects-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 20px;
    }}

    .project-card {{
      background: var(--bg-card);
      border: 1px solid var(--border-subtle);
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      transition: all 0.2s ease;
    }}

    .project-card:hover {{
      border-color: var(--border);
      box-shadow: 0 6px 20px rgba(0,0,0,0.06);
    }}

    .project-card.featured {{
      border-top: 3px solid var(--border);
    }}

    .card-category-row {{
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }}

    .category-tag {{
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      background: var(--bg-tag);
      padding: 2px 6px;
      color: var(--text-muted);
    }}

    .featured-badge {{
      font-family: var(--font-mono);
      font-size: 10px;
      font-weight: 700;
      background: #FEF3C7;
      color: #92400E;
      padding: 2px 6px;
    }}

    .card-title {{
      font-family: var(--font-heading);
      font-size: 1.35rem;
      font-weight: 700;
      color: var(--text-main);
      margin-bottom: 4px;
    }}

    .card-tagline {{
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 12px;
      font-weight: 500;
    }}

    .card-description {{
      font-size: 0.9rem;
      color: var(--text-sub);
      line-height: 1.6;
      margin-bottom: 16px;
      flex-grow: 1;
    }}

    .metric-callout {{
      font-family: var(--font-mono);
      font-size: 0.775rem;
      font-weight: 700;
      background: var(--bg-tag);
      border-left: 2px solid var(--border);
      padding: 6px 10px;
      margin-bottom: 14px;
      color: var(--text-main);
    }}

    .tech-stack-row {{
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }}

    .tech-badge {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 600;
      background: var(--bg-tag);
      border: 1px solid var(--border-subtle);
      padding: 2px 6px;
      color: var(--text-main);
    }}

    .card-links-row {{
      display: flex;
      gap: 12px;
      margin-top: auto;
      border-top: 1px dashed var(--border-subtle);
      padding-top: 12px;
    }}

    .card-link {{
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none;
      color: var(--text-main);
    }}

    .card-link.primary {{
      text-decoration: underline;
    }}

    .card-link.secondary {{
      color: var(--text-muted);
    }}

    /* Skills Grid */
    .skills-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }}

    .skills-column {{
      background: var(--bg-tag);
      border: 1px solid var(--border-subtle);
      padding: 16px;
    }}

    .skill-category-title {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 10px;
      color: var(--text-muted);
      border-bottom: 1px solid var(--border-subtle);
      padding-bottom: 4px;
    }}

    .skill-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }}

    .skill-item {{
      font-size: 13px;
      font-weight: 600;
      color: var(--text-main);
    }}

    /* Experience Timeline */
    .timeline-entry {{
      border: 1px solid var(--border-subtle);
      padding: 20px;
      margin-bottom: 16px;
      background: var(--bg-card);
    }}

    .timeline-header {{
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 8px;
    }}

    .timeline-role {{
      font-family: var(--font-heading);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-main);
    }}

    .timeline-company {{
      font-size: 0.9rem;
      font-weight: 600;
      color: var(--text-sub);
    }}

    .timeline-duration {{
      font-family: var(--font-mono);
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--text-muted);
    }}

    .timeline-desc {{
      font-size: 0.9rem;
      color: var(--text-sub);
      margin-bottom: 10px;
    }}

    .timeline-bullets {{
      padding-left: 18px;
      font-size: 0.885rem;
      color: var(--text-sub);
    }}

    .timeline-bullets li {{
      margin-bottom: 4px;
    }}

    /* Education & Achievements */
    .edu-grid {{
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }}

    .edu-card {{
      background: var(--bg-tag);
      border: 1px solid var(--border-subtle);
      padding: 16px;
    }}

    .edu-top {{
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }}

    .edu-yr {{
      font-family: var(--font-mono);
      font-size: 11px;
      color: var(--text-muted);
    }}

    .edu-inst {{
      font-size: 0.85rem;
      color: var(--text-sub);
    }}

    .edu-det {{
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 4px;
    }}

    .ach-list {{
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }}

    .ach-item {{
      background: var(--bg-tag);
      border: 1px solid var(--border-subtle);
      padding: 10px 14px;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 8px;
    }}

    .ach-star {{
      color: var(--accent);
      font-size: 1.1rem;
    }}

    /* Footer */
    .footer {{
      border-top: 2px solid var(--border);
      padding-top: 24px;
      margin-top: 56px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-family: var(--font-mono);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }}

    @media (max-width: 768px) {{
      body {{
        padding: 12px 8px 48px;
      }}
      .container {{
        padding: 24px 16px;
      }}
      .hero-name {{
        font-size: 2.25rem;
      }}
      .projects-grid {{
        grid-template-columns: 1fr;
      }}
    }}
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <header class="header">
      <div class="badge-row">
        <span class="edition-tag">Portfolio &bull; Dossier Edition</span>
        {f'<span class="availability-pill"><span class="availability-dot"></span>{availability}</span>' if availability else ''}
      </div>
      <h1 class="hero-name">{name}</h1>
      {f'<h2 class="hero-headline">{headline}</h2>' if headline else ''}
      {f'<p class="hero-tagline">{tagline}</p>' if tagline else ''}
      
      <div class="contact-row">
        {contact_html}
      </div>
    </header>

    <!-- Bio Summary -->
    {f'''
    <section class="section">
      <h3 class="section-heading">Executive Narrative</h3>
      <p class="bio-text">{bio}</p>
    </section>''' if bio else ''}

    <!-- Featured Projects -->
    <section class="section">
      <h3 class="section-heading">Landmark Projects & Architectures</h3>
      <div class="projects-grid">
        {projects_html}
      </div>
    </section>

    <!-- Skills Matrix -->
    {f'''
    <section class="section">
      <h3 class="section-heading">Technical Competencies & Stack</h3>
      <div class="skills-grid">
        {skills_html}
      </div>
    </section>''' if skills_html else ''}

    <!-- Experience Timeline -->
    {f'''
    <section class="section">
      <h3 class="section-heading">Professional Experience</h3>
      <div class="timeline-list">
        {experience_html}
      </div>
    </section>''' if experience_html else ''}

    <!-- Education & Achievements -->
    {f'''
    <section class="section">
      <h3 class="section-heading">Education & Recognitions</h3>
      <div class="edu-grid" style="margin-bottom: 20px;">
        {edu_html}
      </div>
      {f'<ul class="ach-list">{ach_html}</ul>' if ach_html else ''}
    </section>''' if (edu_html or ach_html) else ''}

    <!-- Footer -->
    <footer class="footer">
      <span>Generated with Python & Gemini</span>
      <span>&copy; {name}</span>
    </footer>
  </div>
</body>
</html>"""
    return html_template


def main():
    parser = argparse.ArgumentParser(description="AI-Powered Resume PDF to Portfolio Generator (Python Backend)")
    parser.add_argument("--pdf", type=str, help="Path to input Resume PDF file")
    parser.add_argument("--input", type=str, default="resume.txt", help="Path to input resume text file (or resume.pdf)")
    parser.add_argument("--theme", type=str, default="editorial", choices=["editorial", "minimal", "cyber", "bento"], help="Theme styling")
    parser.add_argument("--output", type=str, default="portfolio.html", help="Path to write generated HTML file")
    parser.add_argument("--json-output", type=str, default="portfolio.json", help="Path to write structured JSON")

    args = parser.parse_args()

    input_file = args.pdf if args.pdf else args.input

    # If default input doesn't exist but resume.pdf does, use resume.pdf
    if not os.path.exists(input_file) and os.path.exists("resume.pdf"):
        input_file = "resume.pdf"

    print("=" * 65)
    print(" Python Backend: Resume PDF to Standalone Portfolio Generator")
    print("=" * 65)
    print(f"[*] Input Resume : {input_file}")
    print(f"[*] Chosen Theme : {args.theme}")
    print(f"[*] Target HTML  : {args.output}")

    api_key = get_api_key()
    if not api_key:
        print("[WARN] GEMINI_API_KEY not found in environment. Utilizing intelligent local parser.", file=sys.stderr)

    # 1. Read input resume
    text_content, base64_pdf = read_resume_file(input_file)
    if not text_content and not base64_pdf:
        print(f"[ERROR] Could not extract any data from '{input_file}'.", file=sys.stderr)
        sys.exit(1)

    # 2. Classify with Gemini API (or intelligent fallback)
    print(f"[2/5] Classifying resume data via Gemini API...")
    raw_json_str = classify_resume_with_gemini(text_content, base64_pdf, api_key)
    if not raw_json_str:
        print("[ERROR] Classification failed.", file=sys.stderr)
        sys.exit(1)

    # 3. Parse JSON
    print("[3/5] Validating classified schema...")
    cleaned_json = raw_json_str.strip()
    if cleaned_json.startswith("```json"):
        cleaned_json = cleaned_json[7:]
    if cleaned_json.startswith("```"):
        cleaned_json = cleaned_json[3:]
    if cleaned_json.endswith("```"):
        cleaned_json = cleaned_json[:-3]
    cleaned_json = cleaned_json.strip()

    try:
        parsed_data = json.loads(cleaned_json)
        parsed_data["theme"] = args.theme
    except Exception as e:
        print(f"[ERROR] JSON parse error: {e}", file=sys.stderr)
        print("Raw output:", raw_json_str[:300], file=sys.stderr)
        sys.exit(1)

    # Write portfolio.json
    try:
        with open(args.json_output, "w", encoding="utf-8") as f:
            json.dump(parsed_data, f, indent=2)
        print(f"      Saved structured data to '{args.json_output}'.")
    except Exception as e:
        print(f"[WARN] Failed to write '{args.json_output}': {e}", file=sys.stderr)

    # 4. Generate standalone portfolio.html
    print(f"[4/5] Compiling standalone HTML file ({args.theme} theme)...")
    compiled_html = generate_standalone_portfolio_html(parsed_data, args.theme)

    # 5. Write portfolio.html
    try:
        with open(args.output, "w", encoding="utf-8") as f:
            f.write(compiled_html)
        print(f"[5/5] Success! Standalone portfolio written to '{args.output}'")
        print("=" * 65)
        print(f"Generated portfolio ready: {len(compiled_html)} bytes.")
    except Exception as e:
        print(f"[ERROR] Failed to write '{args.output}': {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
