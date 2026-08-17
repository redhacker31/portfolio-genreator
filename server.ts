import express from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import multer from 'multer';
import { PDFParse } from 'pdf-parse';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { generatePortfolioHtml } from './src/utils/portfolioHtmlGenerator';
import { PortfolioData, PortfolioTheme } from './src/types';

const app = express();
const PORT = 3000;

// Setup multer memory storage for PDF upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB limit
});

app.use(express.json({ limit: '30mb' }));
app.use(express.urlencoded({ extended: true, limit: '30mb' }));

// Lazy initializer for Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY || '';
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

// Helper to extract text from PDF using PDFParse with Gemini multimodal fallback
async function extractTextFromPdfBuffer(buffer: Buffer, fileName: string = 'resume.pdf'): Promise<{ text: string; method: string }> {
  // 1. Try local PDF parser
  try {
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const parsedText = result?.text ? result.text.trim() : '';
    if (typeof parser.destroy === 'function') {
      await parser.destroy();
    }
    // Clean up excessive page artifacts
    const cleaned = parsedText.replace(/--\s*\d+\s*of\s*\d+\s*--/g, '').trim();
    if (cleaned.length > 40) {
      return { text: cleaned, method: 'PDF Stream Parser' };
    }
  } catch (err: any) {
    console.warn('[PDFParse Local Warning]', err.message);
  }

  // 2. Multimodal Gemini OCR / Document Extraction fallback
  try {
    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: buffer.toString('base64'),
              }
            },
            {
              text: 'You are an expert document OCR and resume parser. Transcribe and extract all information from this resume PDF in plain text format. Preserve all candidate details, headline, contact channels, work experience, accomplishments, bullet points, skills, education, projects, metrics, and dates accurately.'
            }
          ]
        }
      ]
    });
    const geminiText = response.text ? response.text.trim() : '';
    if (geminiText.length > 20) {
      return { text: geminiText, method: 'Gemini Multimodal Document Parser' };
    }
  } catch (geminiErr: any) {
    console.warn('[Gemini Multimodal PDF Warning]', geminiErr.message);
  }

  return { text: '', method: 'none' };
}

// System prompt for structured portfolio extraction
const RESUME_EXTRACTION_SYSTEM_PROMPT = `You are a Principal Portfolio Architect & Technical Recruiter.
Analyze the provided resume and return a complete, valid JSON object strictly matching this schema.

Rules:
1. Extract the candidate's exact name, professional headline, impactful value-proposition tagline, and a polished 2-3 sentence executive bio.
2. Group all technical and professional skills into structured categories (e.g. "Core Languages", "Frameworks & Frontend", "Cloud & Distributed Systems", "Databases & Storage", "Developer Tooling", "AI & ML").
3. Extract distinct landmark projects (either standalone projects or key initiatives from work experience), with title, category, description, tech stack, and quantifiable impact metrics (e.g. "⚡ 50M+ requests/day", "🚀 +45% query speed", "⭐ 1.2k GitHub stars").
4. Extract detailed work experience with company name, title, duration, location, overview, and quantified achievement bullet points.
5. Extract education, certifications, and awards.
6. Return ONLY valid JSON with no markdown wrapping or code fences.

Schema:
{
  "name": "Full Name",
  "headline": "Professional Title / Specialization",
  "tagline": "Short punchy value proposition tagline",
  "bio": "Engaging professional bio",
  "location": "City, State / Remote",
  "availability": "Available for Full-Time & Consulting",
  "contact": {
    "email": "email@example.com",
    "phone": "+1 (555) 000-0000",
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "",
    "website": ""
  },
  "skills": [
    {
      "category": "Core Languages",
      "items": ["Python", "TypeScript", "Go"]
    }
  ],
  "projects": [
    {
      "id": "p1",
      "title": "Project Title",
      "category": "Full-Stack",
      "tagline": "One sentence summary",
      "description": "2-3 sentences explaining technical implementation and problem solved",
      "metrics": "⚡ 50M+ reqs/day",
      "techStack": ["Python", "React", "PostgreSQL"],
      "liveUrl": "",
      "githubUrl": "",
      "featured": true
    }
  ],
  "experience": [
    {
      "id": "e1",
      "role": "Role Title",
      "company": "Company Name",
      "duration": "2022 — Present",
      "location": "Location",
      "description": "Responsibilities summary",
      "highlights": ["Quantified bullet 1", "Quantified bullet 2"]
    }
  ],
  "education": [
    {
      "id": "ed1",
      "degree": "Degree and Major",
      "institution": "University Name",
      "year": "Graduation Year",
      "details": "Honors / Key coursework"
    }
  ],
  "achievements": ["Achievement 1", "Certification 2"],
  "theme": "editorial"
}`;

async function extractStructuredPortfolioWithGemini(textOrPdf: { text?: string; pdfBuffer?: Buffer }, preferredTheme: PortfolioTheme = 'editorial'): Promise<PortfolioData> {
  const ai = getGeminiClient();
  const parts: any[] = [];

  if (textOrPdf.pdfBuffer) {
    parts.push({
      inlineData: {
        mimeType: 'application/pdf',
        data: textOrPdf.pdfBuffer.toString('base64'),
      }
    });
  }

  if (textOrPdf.text) {
    parts.push({
      text: `RESUME TEXT CONTENT:\n${textOrPdf.text}`
    });
  }

  parts.push({
    text: `${RESUME_EXTRACTION_SYSTEM_PROMPT}\n\nPlease analyze this resume and output the structured JSON portfolio.`
  });

  const models = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.1-flash-lite',
    'gemini-flash-lite-latest',
    'gemini-3-flash-preview',
    'gemini-3.7-flash'
  ];
  let lastError = '';

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        }
      });

      const raw = response.text?.trim() || '';
      let cleaned = raw;
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);

      const parsed: PortfolioData = JSON.parse(cleaned.trim());
      if (parsed && parsed.name) {
        parsed.theme = preferredTheme;
        return parsed;
      }
    } catch (err: any) {
      lastError = err.message;
    }
  }

  throw new Error(`Gemini classification failed: ${lastError}`);
}

// 1. API: Get all project files for workspace inspector
app.get('/api/files', (req, res) => {
  try {
    const cwd = process.cwd();
    const files = {
      'portfolio.html': fs.existsSync(path.join(cwd, 'portfolio.html')) ? fs.readFileSync(path.join(cwd, 'portfolio.html'), 'utf-8') : '',
      'portfolio.json': fs.existsSync(path.join(cwd, 'portfolio.json')) ? fs.readFileSync(path.join(cwd, 'portfolio.json'), 'utf-8') : '',
      'resume.txt': fs.existsSync(path.join(cwd, 'resume.txt')) ? fs.readFileSync(path.join(cwd, 'resume.txt'), 'utf-8') : '',
      'main.py': fs.existsSync(path.join(cwd, 'main.py')) ? fs.readFileSync(path.join(cwd, 'main.py'), 'utf-8') : '',
      'template.html': fs.existsSync(path.join(cwd, 'template.html')) ? fs.readFileSync(path.join(cwd, 'template.html'), 'utf-8') : '',
      'style.css': fs.existsSync(path.join(cwd, 'style.css')) ? fs.readFileSync(path.join(cwd, 'style.css'), 'utf-8') : '',
      'README.md': fs.existsSync(path.join(cwd, 'README.md')) ? fs.readFileSync(path.join(cwd, 'README.md'), 'utf-8') : '',
      'requirements.txt': fs.existsSync(path.join(cwd, 'requirements.txt')) ? fs.readFileSync(path.join(cwd, 'requirements.txt'), 'utf-8') : '',
      '.env.example': fs.existsSync(path.join(cwd, '.env.example')) ? fs.readFileSync(path.join(cwd, '.env.example'), 'utf-8') : '',
    };
    res.json({ success: true, files });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. API: Upload Resume (PDF or Text) and extract data
app.post('/api/upload-resume', upload.single('resumeFile'), async (req, res) => {
  try {
    const cwd = process.cwd();
    let extractedText = '';
    let isPdf = false;
    let fileName = 'resume.txt';
    let extractionMethod = 'text-input';

    if (req.file) {
      fileName = req.file.originalname;
      const isPdfFile = req.file.mimetype === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      
      if (isPdfFile) {
        isPdf = true;
        // Save PDF to workspace
        fs.writeFileSync(path.join(cwd, 'resume.pdf'), req.file.buffer);
        
        // Extract text from PDF buffer
        const extraction = await extractTextFromPdfBuffer(req.file.buffer, fileName);
        extractedText = extraction.text;
        extractionMethod = extraction.method;

        // Save extracted text as resume.txt
        if (extractedText.trim()) {
          fs.writeFileSync(path.join(cwd, 'resume.txt'), extractedText, 'utf-8');
        }
      } else {
        // Plain text file (.txt, .md, etc.)
        extractedText = req.file.buffer.toString('utf-8');
        fs.writeFileSync(path.join(cwd, 'resume.txt'), extractedText, 'utf-8');
        extractionMethod = 'utf8-text-reader';
      }
    } else if (req.body.resumeText) {
      extractedText = req.body.resumeText;
      fs.writeFileSync(path.join(cwd, 'resume.txt'), extractedText, 'utf-8');
      extractionMethod = 'direct-text-editor';
    } else if (req.body.base64Pdf) {
      isPdf = true;
      const buffer = Buffer.from(req.body.base64Pdf, 'base64');
      fs.writeFileSync(path.join(cwd, 'resume.pdf'), buffer);
      const extraction = await extractTextFromPdfBuffer(buffer, 'resume.pdf');
      extractedText = extraction.text;
      extractionMethod = extraction.method;
      if (extractedText.trim()) {
        fs.writeFileSync(path.join(cwd, 'resume.txt'), extractedText, 'utf-8');
      }
    } else {
      return res.status(400).json({ success: false, error: 'No resume file or text provided.' });
    }

    res.json({
      success: true,
      fileName,
      isPdf,
      extractionMethod,
      textLength: extractedText.length,
      wordCount: extractedText.trim() ? extractedText.trim().split(/\s+/).length : 0,
      extractedText: extractedText.trim(),
    });
  } catch (err: any) {
    console.error('Upload Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. API: Run Python Backend Generator (main.py) with resilient fallback
app.post('/api/run-python-generator', async (req, res) => {
  try {
    const { theme = 'editorial', usePdf = false, resumeText = '' } = req.body;
    const cwd = process.cwd();

    // Ensure resume.txt is updated if user passed custom resumeText
    if (resumeText && typeof resumeText === 'string' && resumeText.trim().length > 10) {
      fs.writeFileSync(path.join(cwd, 'resume.txt'), resumeText.trim(), 'utf-8');
    }

    const pdfPath = path.join(cwd, 'resume.pdf');
    const txtPath = path.join(cwd, 'resume.txt');

    let command = `python3 main.py --theme ${theme}`;
    if (usePdf && fs.existsSync(pdfPath)) {
      command += ` --pdf resume.pdf`;
    } else if (fs.existsSync(txtPath)) {
      command += ` --input resume.txt`;
    }

    exec(command, { cwd, env: process.env, timeout: 60000 }, async (error, stdout, stderr) => {
      const portfolioHtmlPath = path.join(cwd, 'portfolio.html');
      const portfolioJsonPath = path.join(cwd, 'portfolio.json');

      let portfolioHtml = fs.existsSync(portfolioHtmlPath) ? fs.readFileSync(portfolioHtmlPath, 'utf-8') : '';
      let portfolioData: PortfolioData | null = null;
      if (fs.existsSync(portfolioJsonPath)) {
        try {
          portfolioData = JSON.parse(fs.readFileSync(portfolioJsonPath, 'utf-8'));
        } catch (e) {
          // ignore
        }
      }

      // If python successfully produced structured data and HTML
      if (!error && portfolioData && portfolioHtml) {
        return res.json({
          success: true,
          command,
          exitCode: 0,
          stdout,
          stderr,
          portfolioHtml,
          portfolioData,
        });
      }

      // If Python execution encountered an issue, use Node + Gemini fallback
      console.warn('[Python Generator Note] Triggering Node.js Gemini Generator Fallback:', error?.message || stderr);
      try {
        let pdfBuffer: Buffer | undefined;
        if (usePdf && fs.existsSync(pdfPath)) {
          pdfBuffer = fs.readFileSync(pdfPath);
        }
        const textContent = fs.existsSync(txtPath) ? fs.readFileSync(txtPath, 'utf-8') : resumeText;

        const generatedData = await extractStructuredPortfolioWithGemini({
          text: textContent,
          pdfBuffer
        }, theme as PortfolioTheme);

        const generatedHtml = generatePortfolioHtml(generatedData, theme as PortfolioTheme);

        fs.writeFileSync(portfolioJsonPath, JSON.stringify(generatedData, null, 2), 'utf-8');
        fs.writeFileSync(portfolioHtmlPath, generatedHtml, 'utf-8');

        return res.json({
          success: true,
          command,
          exitCode: 0,
          stdout: `${stdout}\n[FALLBACK_RECOVERY] Extracted and compiled portfolio successfully via Gemini Pipeline.`,
          stderr: '',
          portfolioHtml: generatedHtml,
          portfolioData: generatedData,
        });
      } catch (fallbackErr: any) {
        return res.status(500).json({
          success: false,
          command,
          exitCode: 1,
          stdout,
          stderr: `Python execution error: ${stderr || error?.message}\nFallback error: ${fallbackErr.message}`,
          portfolioHtml,
          portfolioData,
        });
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. API: Save updated Portfolio JSON & HTML
app.post('/api/save-portfolio', (req, res) => {
  try {
    const { portfolioData, portfolioHtml } = req.body;
    const cwd = process.cwd();

    if (portfolioData) {
      fs.writeFileSync(path.join(cwd, 'portfolio.json'), JSON.stringify(portfolioData, null, 2), 'utf-8');
    }
    if (portfolioHtml) {
      fs.writeFileSync(path.join(cwd, 'portfolio.html'), portfolioHtml, 'utf-8');
    }

    res.json({ success: true, message: 'Portfolio saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. API: Direct Download Endpoint for portfolio.html
app.get('/api/download-portfolio', (req, res) => {
  const filePath = path.join(process.cwd(), 'portfolio.html');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio.html"');
    res.sendFile(filePath);
  } else {
    res.status(404).send('portfolio.html has not been generated yet.');
  }
});

// 6. API: Direct Download Endpoint for portfolio.json
app.get('/api/download-json', (req, res) => {
  const filePath = path.join(process.cwd(), 'portfolio.json');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="portfolio.json"');
    res.sendFile(filePath);
  } else {
    res.status(404).send('portfolio.json not found.');
  }
});

// 7. API: Direct Gemini AI Generation for Live Rewriting/Expansion
app.post('/api/generate-portfolio-ai', async (req, res) => {
  try {
    const { prompt, currentData } = req.body;
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 4) {
      return res.status(400).json({ success: false, error: 'Please provide instructions or resume content.' });
    }

    const ai = getGeminiClient();
    const systemPrompt = `You are a Principal Portfolio Architect.
Extract or synthesize a complete, professional portfolio model from the user prompt or resume content.

Guidelines:
- Generate compelling, quantifiable project impact metrics (e.g. '⚡ 50M+ requests/day', '🚀 +40% speed', '⭐ 2.4k GitHub stars').
- Categorize skills systematically (Languages, Frameworks, Cloud, Databases, Tooling).
- Write a high-impact headline, executive summary, and project details.
- Return ONLY valid JSON matching this exact structure:
{
  "name": "Full Name",
  "headline": "Role / Title",
  "tagline": "Punchy value proposition tagline",
  "bio": "Engaging professional bio",
  "location": "City, State / Remote",
  "availability": "Available for Full-Time / Consulting",
  "contact": {
    "email": "email@example.com",
    "phone": "+1 (555) 000-0000",
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "twitter": "",
    "website": "https://example.com"
  },
  "skills": [
    {
      "category": "Core Languages",
      "items": ["Python", "TypeScript", "Go"]
    }
  ],
  "projects": [
    {
      "id": "p1",
      "title": "Project Name",
      "category": "Full-Stack",
      "tagline": "Short tagline",
      "description": "2-3 sentences of architecture details",
      "metrics": "⚡ 50M+ reqs/day",
      "techStack": ["React", "FastAPI", "PostgreSQL"],
      "liveUrl": "https://demo.example.com",
      "githubUrl": "https://github.com/example",
      "featured": true
    }
  ],
  "experience": [
    {
      "id": "e1",
      "role": "Job Title",
      "company": "Company Name",
      "duration": "2021 — Present",
      "location": "San Francisco, CA",
      "description": "Responsibilities",
      "highlights": ["Key achievement bullet 1", "Key achievement bullet 2"]
    }
  ],
  "education": [
    {
      "id": "ed1",
      "degree": "B.S. in Computer Science",
      "institution": "University",
      "year": "2020",
      "details": "Honors"
    }
  ],
  "achievements": ["Achievement 1", "Achievement 2"],
  "theme": "editorial"
}`;

    const models = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.1-flash-lite',
      'gemini-flash-lite-latest',
      'gemini-3-flash-preview',
      'gemini-3.7-flash'
    ];
    let parsedData = null;
    let lastError = '';

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nUSER INPUT / RESUME DATA:\n${prompt}\n\n${currentData ? `CURRENT DATA STATE:\n${JSON.stringify(currentData)}` : ''}`
                }
              ]
            }
          ],
          config: {
            responseMimeType: 'application/json',
          }
        });

        const rawText = response.text || '';
        let cleaned = rawText.trim();
        if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
        if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
        if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
        
        parsedData = JSON.parse(cleaned.trim());
        break;
      } catch (err: any) {
        lastError = err.message;
        continue;
      }
    }

    if (!parsedData) {
      return res.status(500).json({ success: false, error: `AI generation failed: ${lastError}` });
    }

    const cwd = process.cwd();
    fs.writeFileSync(path.join(cwd, 'portfolio.json'), JSON.stringify(parsedData, null, 2), 'utf-8');

    res.json({ success: true, portfolioData: parsedData });
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ success: false, error: err.message || 'AI Generation failed.' });
  }
});

// Serve style.css for standalone preview
app.get('/style.css', (req, res) => {
  const cssPath = path.join(process.cwd(), 'style.css');
  if (fs.existsSync(cssPath)) {
    res.setHeader('Content-Type', 'text/css');
    res.sendFile(cssPath);
  } else {
    res.status(404).send('Not found');
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Resume PDF Portfolio Generator Server running on http://localhost:${PORT}`);
  });
}

startServer();
