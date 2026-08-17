import React, { useState, useEffect } from 'react';
import { PortfolioHeader } from './components/PortfolioHeader';
import { ResumePDFUploader } from './components/ResumePDFUploader';
import { LivePortfolioPreview } from './components/LivePortfolioPreview';
import { PortfolioData, PortfolioTheme } from './types';
import { generatePortfolioHtml } from './utils/portfolioHtmlGenerator';

const INITIAL_PORTFOLIO: PortfolioData = {
  name: 'Your Name',
  headline: 'Software Engineer & Builder',
  tagline: 'Building impactful, high-performance systems and user experiences.',
  bio: 'Experienced technologist focused on scalable distributed systems, elegant frontends, and AI engineering.',
  location: 'San Francisco, CA',
  availability: 'Open to opportunities',
  contact: {
    email: 'contact@example.com',
    github: 'https://github.com',
    linkedin: 'https://linkedin.com'
  },
  skills: [
    { category: 'Languages & Core', items: ['Python', 'TypeScript', 'JavaScript', 'SQL'] },
    { category: 'Frameworks & Web', items: ['React', 'Node.js', 'FastAPI', 'Tailwind CSS'] },
    { category: 'Cloud & Infrastructure', items: ['Docker', 'AWS', 'GCP', 'PostgreSQL', 'CI/CD'] }
  ],
  projects: [
    {
      id: 'p1',
      title: 'DevFlow - Developer Workflow Assistant',
      category: 'AI & ML',
      tagline: 'CLI & web assistant analyzing codebases and automating tasks.',
      description: 'Built a command-line tool and web interface that analyzes codebases and automates repetitive development tasks with AI.',
      techStack: ['Python', 'FastAPI', 'React', 'Gemini API'],
      featured: true
    }
  ],
  experience: [
    {
      id: 'e1',
      role: 'Software Engineer',
      company: 'Tech Innovations Inc.',
      duration: '2022 — Present',
      location: 'San Francisco, CA',
      description: 'Designing and deploying scalable backend microservices and modern web interfaces.',
      highlights: [
        'Architected and deployed microservices handling high-throughput production API requests.',
        'Engineered responsive interfaces in React and TypeScript.'
      ]
    }
  ],
  education: [
    {
      id: 'ed1',
      degree: 'B.S. in Computer Science',
      institution: 'University of California',
      year: '2018 — 2022'
    }
  ],
  services: [],
  testimonials: [],
  achievements: [],
  theme: 'editorial'
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(INITIAL_PORTFOLIO);
  const [currentTheme, setCurrentTheme] = useState<PortfolioTheme>('editorial');

  // Sync and save generated HTML to server
  const savePortfolioToServer = async (data: PortfolioData, theme: PortfolioTheme) => {
    try {
      const html = generatePortfolioHtml(data, theme);
      await fetch('/api/save-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioData: data, portfolioHtml: html })
      });
    } catch (err) {
      console.error('Failed to auto-save portfolio:', err);
    }
  };

  // Fetch initial portfolio data if available
  const fetchCurrentPortfolio = async () => {
    try {
      const res = await fetch('/api/files');
      const data = await res.json();
      if (data.success && data.files && data.files['portfolio.json']) {
        try {
          const parsed = JSON.parse(data.files['portfolio.json']);
          if (parsed.name && parsed.projects) {
            setPortfolioData(parsed);
            if (parsed.theme) {
              setCurrentTheme(parsed.theme);
            }
          }
        } catch (e) {
          // fallback to default
        }
      }
    } catch (err) {
      console.error('Failed to fetch files:', err);
    }
  };

  useEffect(() => {
    fetchCurrentPortfolio();
  }, []);

  // Theme change handler
  const handleThemeChange = (newTheme: PortfolioTheme) => {
    setCurrentTheme(newTheme);
    const updated = { ...portfolioData, theme: newTheme };
    setPortfolioData(updated);
    savePortfolioToServer(updated, newTheme);
  };

  // Handle Portfolio Generated from Resume PDF or Python
  const handlePortfolioGenerated = (newData: PortfolioData, _generatedHtml: string) => {
    setPortfolioData(newData);
    setCurrentTheme(newData.theme || currentTheme);
    savePortfolioToServer(newData, newData.theme || currentTheme);
    setActiveTab('preview');
  };

  // Export HTML Download
  const handleExportHtml = () => {
    const html = generatePortfolioHtml(portfolioData, currentTheme);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const safeName = (portfolioData.name || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    a.download = `${safeName || 'portfolio'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    savePortfolioToServer(portfolioData, currentTheme);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-[#FDFCFB] text-[#1A1A1A] font-sans antialiased overflow-hidden select-none">
      {/* Top Navigation Bar */}
      <PortfolioHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        setTheme={handleThemeChange}
        onExportHtml={handleExportHtml}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 flex overflow-hidden relative">
        {activeTab === 'upload' && (
          <ResumePDFUploader
            onPortfolioGenerated={handlePortfolioGenerated}
            currentTheme={currentTheme}
            setTheme={handleThemeChange}
            onSelectTab={setActiveTab}
          />
        )}

        {activeTab === 'preview' && (
          <LivePortfolioPreview
            portfolioData={portfolioData}
            theme={currentTheme}
            setTheme={handleThemeChange}
            onOpenAIGenerator={() => setActiveTab('upload')}
          />
        )}
      </main>
    </div>
  );
}
