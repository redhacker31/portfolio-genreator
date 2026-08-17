import React, { useState, useEffect } from 'react';
import { PortfolioHeader } from './components/PortfolioHeader';
import { ResumePDFUploader } from './components/ResumePDFUploader';
import { LivePortfolioPreview } from './components/LivePortfolioPreview';
import { SAMPLE_PORTFOLIOS } from './data/samplePortfolios';
import { PortfolioData, PortfolioTheme } from './types';
import { generatePortfolioHtml } from './utils/portfolioHtmlGenerator';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(SAMPLE_PORTFOLIOS.systems_architect);
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
