import React, { useState, useRef, useEffect } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Palette, 
  CheckCircle2,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { PortfolioData, PortfolioTheme } from '../types';
import { generatePortfolioHtml } from '../utils/portfolioHtmlGenerator';

interface LivePortfolioPreviewProps {
  portfolioData: PortfolioData;
  theme: PortfolioTheme;
  setTheme: (theme: PortfolioTheme) => void;
  onOpenAIGenerator: () => void;
}

export const LivePortfolioPreview: React.FC<LivePortfolioPreviewProps> = ({
  portfolioData,
  theme,
  setTheme,
  onOpenAIGenerator,
}) => {
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const htmlContent = generatePortfolioHtml(portfolioData, theme);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();
      }
    }
  }, [htmlContent, viewport, theme]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadHtml = () => {
    const element = document.createElement('a');
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${portfolioData.name.toLowerCase().replace(/\s+/g, '-')}-portfolio.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  };

  return (
    <div className="flex-1 flex flex-col bg-[#FDFCFB] overflow-hidden">
      {/* Sub-Header Toolbar: Viewports, Themes, and Quick Actions */}
      <div className="flex flex-wrap items-center justify-between px-6 py-2.5 bg-[#FAF8F5] border-b border-stone-200 gap-3 shrink-0">
        {/* Left: Viewport Controls */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            Viewport:
          </span>
          <div className="flex items-center gap-0.5 bg-[#ECE8E1] p-0.5 rounded-xs border border-stone-300">
            <button
              onClick={() => setViewport('desktop')}
              className={`px-2.5 py-1 rounded-xs text-xs flex items-center gap-1.5 font-medium transition ${
                viewport === 'desktop' ? 'bg-[#1A1A1A] text-white shadow-2xs' : 'text-stone-700 hover:text-black'
              }`}
              title="Desktop 1024px+ layout"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`px-2.5 py-1 rounded-xs text-xs flex items-center gap-1.5 font-medium transition ${
                viewport === 'tablet' ? 'bg-[#1A1A1A] text-white shadow-2xs' : 'text-stone-700 hover:text-black'
              }`}
              title="Tablet 768px layout"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`px-2.5 py-1 rounded-xs text-xs flex items-center gap-1.5 font-medium transition ${
                viewport === 'mobile' ? 'bg-[#1A1A1A] text-white shadow-2xs' : 'text-stone-700 hover:text-black'
              }`}
              title="Mobile 390px layout"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        {/* Center: Theme Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-stone-500 font-mono">
            <Palette className="w-3.5 h-3.5 text-stone-700" />
            <span>Theme:</span>
          </div>
          <div className="flex items-center gap-1 bg-[#ECE8E1] p-0.5 rounded-xs border border-stone-300">
            {[
              { id: 'editorial', label: 'Editorial' },
              { id: 'minimal', label: 'Minimalist' },
              { id: 'terminal', label: 'Cyber Terminal' },
              { id: 'bento', label: 'Bento Grid' }
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id as PortfolioTheme)}
                className={`px-2.5 py-1 rounded-xs text-xs font-semibold transition ${
                  theme === t.id
                    ? 'bg-[#1A1A1A] text-white shadow-2xs'
                    : 'text-stone-700 hover:text-black hover:bg-stone-200/60'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Quick Tools */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 text-xs text-stone-700 hover:text-black bg-white px-2.5 py-1 rounded-xs border border-stone-300 font-medium transition shadow-2xs"
            title="Copy entire standalone portfolio HTML"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'HTML Copied' : 'Copy HTML'}</span>
          </button>
          <button
            onClick={handleOpenNewTab}
            className="flex items-center gap-1 text-xs text-stone-700 hover:text-black bg-white px-2.5 py-1 rounded-xs border border-stone-300 font-medium transition shadow-2xs"
            title="Open portfolio preview in a new window"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>New Window</span>
          </button>
        </div>
      </div>

      {/* Main Iframe Canvas Display */}
      <div className="flex-1 bg-[#F5F2EC] p-4 md:p-6 flex justify-center items-center overflow-auto">
        <div 
          className={`h-full bg-white transition-all duration-300 rounded-xs overflow-hidden shadow-xl border-2 border-[#1A1A1A] flex flex-col ${
            viewport === 'desktop' 
              ? 'w-full max-w-5xl' 
              : viewport === 'tablet' 
              ? 'w-[768px]' 
              : 'w-[390px]'
          }`}
        >
          {/* Browser Mockup Chrome in Editorial Linen */}
          <div className="bg-[#FAF8F5] border-b border-stone-200 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full border border-stone-400 bg-stone-300" />
              <div className="w-2.5 h-2.5 rounded-full border border-stone-400 bg-stone-300" />
              <div className="w-2.5 h-2.5 rounded-full border border-stone-400 bg-stone-300" />
            </div>

            <div className="bg-white border border-stone-300 rounded-xs px-3 py-0.5 text-[11px] text-stone-600 font-mono max-w-sm truncate text-center">
              https://{portfolioData.name.toLowerCase().replace(/\s+/g, '')}.design/portfolio
            </div>

            <span className="text-[10px] font-mono text-stone-400 uppercase font-semibold">
              {theme} &bull; live
            </span>
          </div>

          {/* Iframe View */}
          <iframe
            ref={iframeRef}
            title="Interactive Portfolio Live Preview"
            className="w-full flex-1 border-0 bg-transparent"
            sandbox="allow-same-origin allow-scripts allow-popups"
          />
        </div>
      </div>
    </div>
  );
};
