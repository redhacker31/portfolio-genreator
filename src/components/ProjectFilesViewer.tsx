import React, { useState } from 'react';
import { Layers, Copy, Check, ChevronRight, FileCode, Download } from 'lucide-react';
import { FileMap } from '../types';

interface ProjectFilesViewerProps {
  files: FileMap;
}

export const ProjectFilesViewer: React.FC<ProjectFilesViewerProps> = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState<string>('portfolio.html');
  const [copied, setCopied] = useState<boolean>(false);

  const fileList = [
    { name: 'portfolio.html', desc: 'Generated Standalone Webpage', icon: '✨' },
    { name: 'portfolio.json', desc: 'Structured Portfolio Data Model', icon: '📦' },
    { name: 'template.html', desc: 'HTML Base Master Template', icon: '🌐' },
    { name: 'style.css', desc: 'Editorial CSS Stylesheet', icon: '🎨' },
    { name: 'main.py', desc: 'Python Generator Script', icon: '🐍' },
    { name: 'resume.txt', desc: 'Source Input Text', icon: '📄' },
    { name: 'requirements.txt', desc: 'Python Dependencies', icon: '📋' },
    { name: 'README.md', desc: 'Project Documentation', icon: '📖' },
    { name: '.env.example', desc: 'Environment Configuration', icon: '🔒' }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(files[selectedFile] || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = files[selectedFile] || '';
    const blob = new Blob([content], { type: 'text/plain' });
    const element = document.createElement('a');
    element.href = URL.createObjectURL(blob);
    element.download = selectedFile;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-[#FDFCFB]">
      {/* Sidebar Directory List */}
      <div className="w-72 bg-[#FAF8F5] border-r border-stone-300 flex flex-col shrink-0">
        <div className="px-5 py-3.5 border-b border-stone-200 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2 font-mono">
          <Layers className="w-4 h-4 text-[#1A1A1A]" />
          Portfolio File Tree
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
          {fileList.map((item) => (
            <button
              key={item.name}
              onClick={() => setSelectedFile(item.name)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs transition-all text-left border ${
                selectedFile === item.name
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] font-bold shadow-xs'
                  : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:text-black'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate">
                <span>{item.icon}</span>
                <div>
                  <span className="font-mono text-[11px] block">{item.name}</span>
                  <span className={`text-[10px] block truncate ${selectedFile === item.name ? 'text-stone-300' : 'text-stone-500'}`}>
                    {item.desc}
                  </span>
                </div>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${selectedFile === item.name ? 'text-white' : 'text-stone-400'}`} />
            </button>
          ))}
        </div>
      </div>

      {/* Code Inspector Area */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-3 border-b border-stone-200 bg-[#FAF8F5]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#1A1A1A]">
            <FileCode className="w-4 h-4 text-stone-700" />
            <span className="font-bold">{selectedFile}</span>
            <span className="text-stone-500 text-[11px]">
              ({(files[selectedFile] || '').length} characters)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 text-xs text-[#1A1A1A] bg-white hover:bg-stone-100 px-3 py-1 rounded-xs border border-stone-300 font-semibold transition"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 text-xs text-[#1A1A1A] bg-white hover:bg-stone-100 px-3 py-1 rounded-xs border border-stone-300 font-semibold transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        <pre className="flex-1 p-6 font-mono text-xs text-stone-800 overflow-auto whitespace-pre-wrap leading-relaxed select-text bg-white">
          {files[selectedFile] || '// Loading file content or file is empty...'}
        </pre>
      </div>
    </div>
  );
};
