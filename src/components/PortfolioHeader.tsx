import React from 'react';
import { 
  Download, 
  Monitor, 
  FolderKanban,
  FileUp,
  Palette
} from 'lucide-react';
import { PortfolioTheme } from '../types';

interface PortfolioHeaderProps {
  activeTab: 'upload' | 'preview';
  setActiveTab: (tab: 'upload' | 'preview') => void;
  currentTheme: PortfolioTheme;
  setTheme: (theme: PortfolioTheme) => void;
  onExportHtml: () => void;
}

export const PortfolioHeader: React.FC<PortfolioHeaderProps> = ({
  activeTab,
  setActiveTab,
  currentTheme,
  setTheme,
  onExportHtml,
}) => {
  const themes: { id: PortfolioTheme; label: string }[] = [
    { id: 'editorial', label: 'Editorial' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'terminal', label: 'Terminal' },
    { id: 'bento', label: 'Bento' },
  ];

  return (
    <header className="flex flex-wrap items-center justify-between px-6 py-3 bg-[#FAF8F5] border-b-2 border-[#1A1A1A] shrink-0 gap-3">
      {/* Brand Identity */}
      <div className="flex items-center gap-3.5">
        <div className="w-9 h-9 border-2 border-[#1A1A1A] bg-[#1A1A1A] text-white flex items-center justify-center rounded-xs shadow-xs">
          <FolderKanban className="w-5 h-5 text-amber-300" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-stone-500 font-mono">
              Python Engine &bull; Gemini AI
            </p>
            <span className="text-[10px] font-mono font-semibold bg-[#ECE8E1] text-[#1A1A1A] px-1.5 py-0.5 rounded-xs border border-stone-300">
              Auto-Download HTML
            </span>
          </div>
          <h1 className="text-lg font-serif font-bold italic tracking-tight text-[#1A1A1A] leading-none mt-0.5">
            AI Resume Portfolio Generator
          </h1>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <nav className="flex items-center gap-1 bg-[#ECE8E1] p-1 rounded-xs border border-stone-300">
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs text-xs font-semibold transition-all ${
            activeTab === 'upload'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-stone-700 hover:text-black hover:bg-stone-200/70'
          }`}
        >
          <FileUp className="w-3.5 h-3.5 text-amber-300" />
          <span>Upload Resume</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xs text-xs font-semibold transition-all ${
            activeTab === 'preview'
              ? 'bg-[#1A1A1A] text-white shadow-xs'
              : 'text-stone-700 hover:text-black hover:bg-stone-200/70'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Live Portfolio</span>
        </button>
      </nav>

      {/* Right Controls: Theme Selector + Download */}
      <div className="flex items-center gap-3">
        {/* Theme Picker */}
        <div className="hidden sm:flex items-center gap-1 bg-[#ECE8E1] p-1 rounded-xs border border-stone-300">
          <Palette className="w-3 h-3 text-stone-500 ml-1 mr-0.5" />
          {themes.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`px-2.5 py-1 rounded-xs text-xs font-medium transition ${
                currentTheme === t.id
                  ? 'bg-[#1A1A1A] text-white shadow-2xs font-semibold'
                  : 'text-stone-700 hover:text-black hover:bg-stone-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Export HTML Button */}
        <button
          onClick={onExportHtml}
          className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-3.5 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
          title="Download standalone portfolio.html file"
        >
          <Download className="w-3.5 h-3.5 text-amber-300" />
          <span>Download HTML</span>
        </button>
      </div>
    </header>
  );
};
