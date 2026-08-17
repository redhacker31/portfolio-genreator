import { PortfolioData, PortfolioTheme } from '../types';

export function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generatePortfolioHtml(data: PortfolioData, selectedTheme?: PortfolioTheme): string {
  const theme = selectedTheme || data.theme || 'editorial';
  const name = escapeHtml(data.name || 'Portfolio');
  const headline = escapeHtml(data.headline || '');
  const tagline = escapeHtml(data.tagline || '');
  const bio = escapeHtml(data.bio || '');
  const location = escapeHtml(data.location || '');
  const availability = escapeHtml(data.availability || '');

  // Theme Variables & CSS
  const getThemeStyles = (themeName: PortfolioTheme) => {
    switch (themeName) {
      case 'terminal':
        return `
          :root {
            --bg-canvas: #0B0F17;
            --bg-card: #111827;
            --bg-surface: #1E293B;
            --bg-tag: #1F2937;
            --text-primary: #F3F4F6;
            --text-secondary: #9CA3AF;
            --text-muted: #6B7280;
            --accent: #10B981;
            --accent-glow: rgba(16, 185, 129, 0.15);
            --border: #374151;
            --border-hover: #10B981;
            --font-display: "JetBrains Mono", monospace;
            --font-body: "JetBrains Mono", monospace;
            --radius-card: 4px;
            --radius-tag: 2px;
          }
        `;
      case 'minimal':
        return `
          :root {
            --bg-canvas: #FFFFFF;
            --bg-card: #F9FAFB;
            --bg-surface: #F3F4F6;
            --bg-tag: #E5E7EB;
            --text-primary: #111827;
            --text-secondary: #4B5563;
            --text-muted: #9CA3AF;
            --accent: #111827;
            --accent-glow: rgba(0, 0, 0, 0.04);
            --border: #E5E7EB;
            --border-hover: #111827;
            --font-display: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
            --font-body: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
            --radius-card: 12px;
            --radius-tag: 6px;
          }
        `;
      case 'bento':
        return `
          :root {
            --bg-canvas: #F8FAFC;
            --bg-card: #FFFFFF;
            --bg-surface: #F1F5F9;
            --bg-tag: #E2E8F0;
            --text-primary: #0F172A;
            --text-secondary: #334155;
            --text-muted: #64748B;
            --accent: #2563EB;
            --accent-glow: rgba(37, 99, 235, 0.08);
            --border: #E2E8F0;
            --border-hover: #2563EB;
            --font-display: "Plus Jakarta Sans", sans-serif;
            --font-body: "Plus Jakarta Sans", sans-serif;
            --radius-card: 16px;
            --radius-tag: 9999px;
          }
        `;
      case 'editorial':
      default:
        return `
          :root {
            --bg-canvas: #FDFCFB;
            --bg-card: #FFFFFF;
            --bg-surface: #FAF8F5;
            --bg-tag: #F4F1EC;
            --text-primary: #1A1A1A;
            --text-secondary: #4A4A4A;
            --text-muted: #767676;
            --accent: #1A1A1A;
            --accent-glow: rgba(26, 26, 26, 0.04);
            --border: #E5E1DA;
            --border-hover: #1A1A1A;
            --border-dark: #1A1A1A;
            --font-display: "Newsreader", "Playfair Display", Georgia, serif;
            --font-body: "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, sans-serif;
            --font-mono: "JetBrains Mono", monospace;
            --radius-card: 2px;
            --radius-tag: 2px;
          }
        `;
    }
  };

  // Projects HTML
  const projectsHtml = data.projects && data.projects.length > 0 ? `
    <section class="section" id="projects">
      <div class="section-header">
        <div>
          <span class="section-label">01 // Featured Work</span>
          <h2 class="section-heading">Projects & Architecture</h2>
        </div>
        <span class="project-count-badge">${data.projects.length} Works</span>
      </div>

      <div class="projects-grid">
        ${data.projects.map((p, idx) => `
          <article class="project-card ${p.featured ? 'is-featured' : ''}">
            <div class="project-top">
              <div class="project-category-row">
                <span class="category-badge">${escapeHtml(p.category || 'Engineering')}</span>
                ${p.metrics ? `<span class="metric-badge">${escapeHtml(p.metrics)}</span>` : ''}
              </div>
              <h3 class="project-title">${escapeHtml(p.title)}</h3>
              <p class="project-tagline">${escapeHtml(p.tagline)}</p>
              <p class="project-desc">${escapeHtml(p.description)}</p>
            </div>

            <div class="project-bottom">
              <div class="tech-stack-list">
                ${(p.techStack || []).map(t => `<span class="tech-pill">${escapeHtml(t)}</span>`).join('')}
              </div>

              <div class="project-actions">
                ${p.liveUrl ? `
                  <a href="${escapeHtml(p.liveUrl)}" class="btn-action primary" target="_blank" rel="noopener noreferrer">
                    <span>Live Demo</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                  </a>
                ` : ''}
                ${p.githubUrl ? `
                  <a href="${escapeHtml(p.githubUrl)}" class="btn-action secondary" target="_blank" rel="noopener noreferrer">
                    <span>Source Code</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                  </a>
                ` : ''}
              </div>
            </div>
          </article>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Skills Matrix HTML
  const skillsHtml = data.skills && data.skills.length > 0 ? `
    <section class="section" id="skills">
      <div class="section-header">
        <div>
          <span class="section-label">02 // Core Competencies</span>
          <h2 class="section-heading">Technical Stack & Capabilities</h2>
        </div>
      </div>

      <div class="skills-grid">
        ${data.skills.map(cat => `
          <div class="skill-category-card">
            <h4 class="skill-category-title">${escapeHtml(cat.category)}</h4>
            <div class="skill-items-list">
              ${(cat.items || []).map(item => `<span class="skill-chip">${escapeHtml(item)}</span>`).join('')}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Services HTML
  const servicesHtml = data.services && data.services.length > 0 ? `
    <section class="section" id="services">
      <div class="section-header">
        <div>
          <span class="section-label">03 // Services</span>
          <h2 class="section-heading">What I Build & Deliver</h2>
        </div>
      </div>

      <div class="services-grid">
        ${data.services.map(s => `
          <div class="service-card">
            <h4 class="service-title">${escapeHtml(s.title)}</h4>
            <p class="service-desc">${escapeHtml(s.description)}</p>
            ${s.tags && s.tags.length > 0 ? `
              <div class="service-tags">
                ${s.tags.map(t => `<span class="service-pill">${escapeHtml(t)}</span>`).join('')}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Experience HTML
  const experienceHtml = data.experience && data.experience.length > 0 ? `
    <section class="section" id="experience">
      <div class="section-header">
        <div>
          <span class="section-label">04 // Career Milestones</span>
          <h2 class="section-heading">Experience & Track Record</h2>
        </div>
      </div>

      <div class="timeline-stack">
        ${data.experience.map(exp => `
          <div class="timeline-entry">
            <div class="timeline-header">
              <div>
                <h4 class="timeline-role">${escapeHtml(exp.role)}</h4>
                <div class="timeline-company">${escapeHtml(exp.company)} ${exp.location ? `&bull; ${escapeHtml(exp.location)}` : ''}</div>
              </div>
              <span class="timeline-duration">${escapeHtml(exp.duration)}</span>
            </div>
            ${exp.description ? `<p class="timeline-desc">${escapeHtml(exp.description)}</p>` : ''}
            ${exp.highlights && exp.highlights.length > 0 ? `
              <ul class="timeline-bullets">
                ${exp.highlights.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  // Testimonials HTML
  const testimonialsHtml = data.testimonials && data.testimonials.length > 0 ? `
    <section class="section" id="testimonials">
      <div class="section-header">
        <div>
          <span class="section-label">05 // Social Proof</span>
          <h2 class="section-heading">Recommendations & Endorsements</h2>
        </div>
      </div>

      <div class="testimonials-grid">
        ${data.testimonials.map(t => `
          <div class="testimonial-card">
            <p class="testimonial-quote">&ldquo;${escapeHtml(t.quote)}&rdquo;</p>
            <div class="testimonial-author-row">
              <span class="author-name">${escapeHtml(t.author)}</span>
              <span class="author-role">${escapeHtml(t.role)} &bull; ${escapeHtml(t.company)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${name} &bull; Portfolio</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Newsreader:ital,opsz,wght@0,6..72,400..700;1,6..72,400..700&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    ${getThemeStyles(theme)}

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-canvas);
      color: var(--text-primary);
      font-family: var(--font-body);
      line-height: 1.6;
      font-size: 15px;
      -webkit-font-smoothing: antialiased;
      padding: 48px 20px 80px;
    }

    .portfolio-wrapper {
      max-width: 960px;
      margin: 0 auto;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      box-shadow: 0 4px 24px -2px rgba(0, 0, 0, 0.05);
      overflow: hidden;
    }

    /* Top Accent Line */
    .top-rule {
      height: 4px;
      background: var(--accent);
    }

    /* Header Masthead / Hero */
    .hero-header {
      padding: 56px 56px 40px;
      border-bottom: 2px solid var(--border-dark, var(--border));
      background: var(--bg-surface);
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .masthead-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 11px;
      font-weight: 600;
      font-family: "JetBrains Mono", monospace;
      padding: 4px 10px;
      border-radius: 9999px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      color: var(--text-primary);
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #10B981;
      display: inline-block;
      box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
    }

    .edition-tag {
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text-muted);
    }

    .hero-main-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 32px;
    }

    .hero-name {
      font-family: var(--font-display);
      font-size: 3.5rem;
      font-weight: 700;
      font-style: italic;
      line-height: 1.05;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-bottom: 8px;
    }

    .hero-headline {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-secondary);
      line-height: 1.4;
      max-width: 680px;
    }

    .hero-tagline {
      font-size: 0.95rem;
      color: var(--text-muted);
      margin-top: 6px;
      line-height: 1.5;
    }

    .hero-bio {
      font-size: 0.95rem;
      color: var(--text-secondary);
      line-height: 1.7;
      padding-top: 16px;
      border-top: 1px dashed var(--border);
    }

    /* Contact Links */
    .contact-row {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      padding-top: 8px;
    }

    .contact-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-tag);
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      transition: all 0.15s ease;
    }

    .contact-pill:hover {
      border-color: var(--border-hover);
      transform: translateY(-1px);
    }

    /* Main Content Sections */
    .main-body {
      padding: 48px 56px;
      display: flex;
      flex-direction: column;
      gap: 56px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .section-label {
      font-family: "JetBrains Mono", monospace;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.15em;
      color: var(--text-muted);
      display: block;
      margin-bottom: 4px;
    }

    .section-heading {
      font-family: var(--font-display);
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
      letter-spacing: -0.01em;
    }

    .project-count-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--bg-surface);
      padding: 2px 8px;
      border-radius: var(--radius-tag);
      border: 1px solid var(--border);
    }

    /* Projects Grid */
    .projects-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
      gap: 20px;
    }

    .project-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 20px;
      transition: all 0.2s ease;
      position: relative;
    }

    .project-card:hover {
      border-color: var(--border-hover);
      box-shadow: 0 8px 24px -4px rgba(0, 0, 0, 0.06);
    }

    .project-card.is-featured {
      border-left: 3px solid var(--accent);
    }

    .project-category-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .category-badge {
      font-family: "JetBrains Mono", monospace;
      font-size: 10px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-muted);
    }

    .metric-badge {
      font-size: 11px;
      font-weight: 600;
      font-family: "JetBrains Mono", monospace;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      padding: 2px 8px;
      border-radius: var(--radius-tag);
      color: var(--text-primary);
    }

    .project-title {
      font-family: var(--font-display);
      font-size: 1.4rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .project-tagline {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: 8px;
      line-height: 1.4;
    }

    .project-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .tech-stack-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 16px;
    }

    .tech-pill {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 600;
      background: var(--bg-tag);
      color: var(--text-primary);
      padding: 3px 8px;
      border-radius: var(--radius-tag);
      border: 1px solid var(--border);
    }

    .project-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }

    .btn-action {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      text-decoration: none;
      padding: 6px 12px;
      border-radius: var(--radius-tag);
      transition: all 0.15s ease;
    }

    .btn-action.primary {
      background: var(--accent);
      color: #FFFFFF;
    }

    .btn-action.primary:hover {
      opacity: 0.9;
    }

    .btn-action.secondary {
      background: var(--bg-surface);
      color: var(--text-primary);
      border: 1px solid var(--border);
    }

    .btn-action.secondary:hover {
      border-color: var(--border-hover);
    }

    /* Skills Grid */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
    }

    .skill-category-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 20px;
    }

    .skill-category-title {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: var(--text-primary);
      margin-bottom: 12px;
    }

    .skill-items-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .skill-chip {
      font-size: 12px;
      font-weight: 500;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 4px 10px;
      border-radius: var(--radius-tag);
      color: var(--text-primary);
    }

    /* Services Grid */
    .services-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
    }

    .service-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .service-title {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .service-desc {
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.55;
      margin-bottom: 12px;
    }

    .service-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .service-pill {
      font-size: 10px;
      font-weight: 600;
      background: var(--bg-card);
      border: 1px solid var(--border);
      padding: 2px 7px;
      border-radius: var(--radius-tag);
    }

    /* Timeline Experience */
    .timeline-stack {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .timeline-entry {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 20px 24px;
    }

    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .timeline-role {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .timeline-company {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }

    .timeline-duration {
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      font-weight: 600;
      background: var(--bg-surface);
      border: 1px solid var(--border);
      padding: 2px 8px;
      border-radius: var(--radius-tag);
    }

    .timeline-desc {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .timeline-bullets {
      padding-left: 18px;
      font-size: 0.85rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .timeline-bullets li {
      margin-bottom: 4px;
    }

    /* Testimonials */
    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(360px, 1fr));
      gap: 16px;
    }

    .testimonial-card {
      background: var(--bg-surface);
      border: 1px solid var(--border);
      border-radius: var(--radius-card);
      padding: 24px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 16px;
    }

    .testimonial-quote {
      font-family: var(--font-display);
      font-size: 1.05rem;
      font-style: italic;
      color: var(--text-primary);
      line-height: 1.6;
    }

    .testimonial-author-row {
      display: flex;
      flex-direction: column;
      gap: 2px;
      border-top: 1px solid var(--border);
      padding-top: 12px;
    }

    .author-name {
      font-size: 12px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .author-role {
      font-size: 11px;
      color: var(--text-muted);
    }

    /* Footer Colophon */
    .portfolio-footer {
      padding: 28px 56px;
      background: var(--bg-surface);
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      font-family: "JetBrains Mono", monospace;
      font-size: 11px;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      body {
        padding: 12px 8px 48px;
      }

      .hero-header {
        padding: 32px 24px;
      }

      .hero-name {
        font-size: 2.4rem;
      }

      .main-body {
        padding: 32px 24px;
        gap: 40px;
      }

      .projects-grid {
        grid-template-columns: 1fr;
      }

      .portfolio-footer {
        padding: 20px 24px;
        flex-direction: column;
        align-items: flex-start;
      }
    }
  </style>
</head>
<body>
  <div class="portfolio-wrapper">
    <div class="top-rule"></div>

    <header class="hero-header">
      <div class="masthead-top">
        <span class="edition-tag">Portfolio Edition &bull; Curated Dossier</span>
        ${availability ? `
          <div class="status-badge">
            <span class="status-dot"></span>
            <span>${availability}</span>
          </div>
        ` : ''}
      </div>

      <div class="hero-main-row">
        <div>
          <h1 class="hero-name">${name}</h1>
          ${headline ? `<p class="hero-headline">${headline}</p>` : ''}
          ${tagline ? `<p class="hero-tagline">${tagline}</p>` : ''}
        </div>
      </div>

      ${bio ? `<p class="hero-bio">${bio}</p>` : ''}

      <div class="contact-row">
        ${data.contact?.email ? `
          <a href="mailto:${escapeHtml(data.contact.email)}" class="contact-pill">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
            <span>${escapeHtml(data.contact.email)}</span>
          </a>
        ` : ''}
        ${data.contact?.github ? `
          <a href="${escapeHtml(data.contact.github)}" class="contact-pill" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
            <span>GitHub</span>
          </a>
        ` : ''}
        ${data.contact?.linkedin ? `
          <a href="${escapeHtml(data.contact.linkedin)}" class="contact-pill" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
            <span>LinkedIn</span>
          </a>
        ` : ''}
        ${data.contact?.website ? `
          <a href="${escapeHtml(data.contact.website)}" class="contact-pill" target="_blank" rel="noopener noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>Website</span>
          </a>
        ` : ''}
      </div>
    </header>

    <main class="main-body">
      ${projectsHtml}
      ${skillsHtml}
      ${servicesHtml}
      ${experienceHtml}
      ${testimonialsHtml}
    </main>

    <footer class="portfolio-footer">
      <span>Built with AI Portfolio Generator</span>
      <span>${escapeHtml(location || 'Global & Remote')}</span>
      <span>&copy; ${new Date().getFullYear()} ${name}</span>
    </footer>
  </div>
</body>
</html>`;
}
