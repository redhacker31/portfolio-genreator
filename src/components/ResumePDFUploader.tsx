import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Download, 
  Eye, 
  FileCode, 
  Palette,
  Check
} from 'lucide-react';
import { PortfolioData, PortfolioTheme } from '../types';

interface ResumePDFUploaderProps {
  onPortfolioGenerated: (data: PortfolioData, html: string) => void;
  currentTheme: PortfolioTheme;
  setTheme: (theme: PortfolioTheme) => void;
  onSelectTab: (tab: 'upload' | 'preview') => void;
}

export const ResumePDFUploader: React.FC<ResumePDFUploaderProps> = ({
  onPortfolioGenerated,
  currentTheme,
  setTheme,
  onSelectTab,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(0);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoDownloaded, setAutoDownloaded] = useState<boolean>(false);
  const [generatedCandidateName, setGeneratedCandidateName] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setIsExtracting(true);
    setAutoDownloaded(false);

    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      setTerminalLogs(prev => [
        ...prev,
        `[UPLOAD] Ingested file '${file.name}' (${(file.size / 1024).toFixed(1)} KB)...`,
        `[PARSER] Extracting text content via Python & PDF stream parser...`
      ]);

      const res = await fetch('/api/upload-resume', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        if (data.extractedText && data.extractedText.trim()) {
          setResumeText(data.extractedText.trim());
          setTerminalLogs(prev => [
            ...prev,
            `[SUCCESS] Extracted ${data.wordCount || 0} words from ${file.name}.`
          ]);
        } else {
          setTerminalLogs(prev => [
            ...prev,
            `[SUCCESS] ${file.name} uploaded. Multimodal AI engine ready to parse directly.`
          ]);
        }
      } else {
        setErrorMessage(data.error || 'Failed to extract text from file.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error uploading file.');
    } finally {
      setIsExtracting(false);
    }
  };

  const triggerHtmlDownload = (html: string, candidateName: string) => {
    try {
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const safeName = (candidateName || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      a.download = `${safeName || 'portfolio'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setAutoDownloaded(true);
    } catch (e) {
      console.error('Auto download failed:', e);
    }
  };

  const handleRunPipeline = async () => {
    if (!resumeText.trim() && !selectedFile) {
      setErrorMessage('Please upload your resume PDF or paste your resume text to generate your portfolio.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);
    setAutoDownloaded(false);
    setActiveStep(1);

    const logs: string[] = [
      `==================================================================`,
      `[PIPELINE START] Running AI Resume Portfolio Generation Engine`,
      `==================================================================`,
      `[STEP 1/4] Preparing resume content & saving to workspace...`
    ];
    setTerminalLogs(logs);

    try {
      // Step 1: Upload / Save text
      const uploadRes = await fetch('/api/upload-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText }),
      });
      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        throw new Error(uploadData.error || 'Failed to save resume input.');
      }

      setActiveStep(2);
      setTerminalLogs(prev => [
        ...prev,
        `[STEP 2/4] Executing Python Backend Pipeline (main.py --theme ${currentTheme})...`,
        `          Sending content to Gemini API for deep semantic classification...`
      ]);

      // Step 2: Run Python main.py script
      const runRes = await fetch('/api/run-python-generator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: currentTheme,
          usePdf: selectedFile ? true : false,
          resumeText: resumeText
        })
      });
      const runData = await runRes.json();

      if (runData.stdout) {
        const stdoutLines = runData.stdout.split('\n').filter((l: string) => l.trim().length > 0);
        setTerminalLogs(prev => [...prev, ...stdoutLines]);
      }

      if (!runData.success) {
        throw new Error(runData.stderr || runData.error || 'Python script execution failed.');
      }

      setActiveStep(3);
      setTerminalLogs(prev => [
        ...prev,
        `[STEP 3/4] Schema validated. Structured data saved to portfolio.json.`,
        `[STEP 4/4] Compiling standalone HTML file with embedded styling & auto-downloading...`
      ]);

      if (runData.portfolioData && runData.portfolioHtml) {
        const candidateName = runData.portfolioData.name || 'portfolio';
        setGeneratedCandidateName(candidateName);

        // Update application state
        onPortfolioGenerated(runData.portfolioData, runData.portfolioHtml);
        
        // Auto-download HTML file immediately
        triggerHtmlDownload(runData.portfolioHtml, candidateName);

        setActiveStep(4);
        setTerminalLogs(prev => [
          ...prev,
          `[SUCCESS] Standalone portfolio.html written and downloaded automatically to your device!`,
          `==================================================================`
        ]);

        // Auto switch to preview after a brief visual confirmation
        setTimeout(() => {
          onSelectTab('preview');
        }, 1200);
      } else {
        throw new Error('Python backend did not return portfolio data.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Generation pipeline failed.');
      setTerminalLogs(prev => [
        ...prev,
        `[ERROR] ${err.message || 'An unknown error occurred.'}`
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  const themes: { id: PortfolioTheme; name: string; desc: string }[] = [
    { id: 'editorial', name: 'Editorial', desc: 'Serif typography, clean borders, high-contrast print aesthetic' },
    { id: 'minimal', name: 'Minimalist', desc: 'Swiss modernist design with generous whitespace and bold headers' },
    { id: 'terminal', name: 'Terminal', desc: 'Cyberpunk monospaced terminal styling with green & amber accents' },
    { id: 'bento', name: 'Bento Grid', desc: 'Modern card grid layout with organized visual modularity' }
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-[#FDFCFB] p-6 lg:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Title Section */}
        <div className="border-b border-stone-200 pb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-[#1A1A1A] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-2.5 py-0.5">
              Automated Resume to Portfolio Pipeline
            </span>
          </div>
          <h2 className="text-3xl lg:text-4xl font-serif font-bold italic text-stone-900 tracking-tight">
            Create Your Standalone HTML Portfolio
          </h2>
          <p className="text-stone-600 text-sm mt-2 max-w-2xl leading-relaxed">
            Upload your resume PDF or paste your resume text. The Python engine executes Gemini semantic extraction in the background and automatically generates &amp; downloads your single-file HTML portfolio website.
          </p>
        </div>

        {/* Auto-Download Success Alert */}
        {autoDownloaded && generatedCandidateName && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-600 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 text-emerald-900">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-bold">
                  Portfolio Generated &amp; Downloaded Automatically!
                </p>
                <p className="text-xs text-emerald-800">
                  Downloaded HTML portfolio for <span className="font-semibold">{generatedCandidateName}</span>. Switching to live preview...
                </p>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('preview')}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>View Portfolio</span>
            </button>
          </div>
        )}

        {/* Main Step 1: Upload Resume */}
        <div className="bg-white border-2 border-[#1A1A1A] p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Upload className="w-4 h-4 text-stone-900" />
              Step 1: Upload Your Resume (PDF / TXT / DOCX)
            </h3>
            {selectedFile && (
              <span className="text-xs font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 border border-emerald-200">
                File Ready
              </span>
            )}
          </div>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed p-8 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[190px] ${
              dragActive 
                ? 'border-stone-900 bg-amber-50/60' 
                : selectedFile 
                  ? 'border-emerald-600 bg-emerald-50/30' 
                  : 'border-stone-300 hover:border-stone-800 bg-[#FAF8F5]'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {isExtracting ? (
              <div className="flex flex-col items-center gap-2 text-stone-700">
                <RefreshCw className="w-8 h-8 animate-spin text-stone-900" />
                <span className="text-sm font-semibold">Reading resume stream &amp; extracting text...</span>
              </div>
            ) : selectedFile ? (
              <div className="flex flex-col items-center gap-2.5">
                <div className="w-12 h-12 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-xs flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-stone-900">{selectedFile.name}</p>
                  <p className="text-xs text-stone-500 font-mono mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB &bull; Loaded into generation pipeline
                  </p>
                </div>
                <span className="text-xs text-stone-600 underline hover:text-black font-medium">
                  Click to replace or upload another resume file
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-stone-600">
                <div className="w-12 h-12 bg-stone-100 border border-stone-300 text-stone-700 rounded-xs flex items-center justify-center mb-1">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-base font-serif font-bold text-stone-900">
                  Drop your Resume PDF here
                </p>
                <p className="text-xs text-stone-500">
                  or click to select file from your computer
                </p>
                <span className="text-[11px] font-mono text-stone-400 mt-2 bg-stone-100 px-2 py-0.5 rounded-xs">
                  PDF &bull; DOCX &bull; TXT
                </span>
              </div>
            )}
          </div>

          {/* Optional Text Paste Editor */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-mono font-bold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-stone-700" />
                Or Paste / Edit Resume Text
              </label>
              {resumeText.trim().length > 0 && (
                <span className="text-xs font-mono text-stone-500">
                  {resumeText.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste your resume text here, or let the PDF upload automatically fill this..."
              rows={6}
              className="w-full font-mono text-xs text-stone-800 bg-[#FAF8F5] border border-stone-300 p-3 leading-relaxed focus:outline-none focus:border-stone-800 resize-y"
            />
          </div>
        </div>

        {/* Step 2: Choose Theme */}
        <div className="bg-white border-2 border-[#1A1A1A] p-6 space-y-4 shadow-xs">
          <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2 border-b border-stone-200 pb-3">
            <Palette className="w-4 h-4 text-stone-900" />
            Step 2: Choose Portfolio Aesthetic Theme
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {themes.map(t => {
              const isSelected = currentTheme === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTheme(t.id)}
                  className={`p-3.5 text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                    isSelected 
                      ? 'border-[#1A1A1A] bg-[#FAF8F5] shadow-xs' 
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-serif font-bold text-sm text-stone-900">
                        {t.name}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#1A1A1A]" />
                      )}
                    </div>
                    <p className="text-xs text-stone-600 leading-snug">
                      {t.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Run Generator Action */}
        <div className="bg-white border-2 border-[#1A1A1A] p-6 space-y-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-stone-900">
                Step 3: Generate &amp; Download Portfolio
              </h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Executes Python backend <code className="font-mono bg-stone-100 px-1 py-0.5">main.py</code> in the background and saves standalone HTML.
              </p>
            </div>

            <button
              onClick={handleRunPipeline}
              disabled={isGenerating || isExtracting || (!selectedFile && !resumeText.trim())}
              className="px-8 py-3.5 bg-[#1A1A1A] hover:bg-black text-white text-sm font-bold flex items-center justify-center gap-2 transition disabled:opacity-40 shadow-xs cursor-pointer tracking-wider uppercase shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Processing Python Pipeline...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Generate &amp; Download Portfolio</span>
                </>
              )}
            </button>
          </div>

          {/* Background Terminal Logs */}
          <div className="bg-[#111827] border border-stone-800 text-stone-200 p-4 font-mono text-xs shadow-inner">
            <div className="flex items-center justify-between border-b border-stone-800 pb-2 mb-2.5">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-stone-300 font-bold text-xs">
                  Python Engine Execution Log
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`} />
                <span className="text-[10px] text-stone-400 uppercase">
                  {isGenerating ? 'Running python3 main.py' : 'Ready'}
                </span>
              </div>
            </div>

            {/* Step Progress Bar */}
            {isGenerating && (
              <div className="grid grid-cols-4 gap-2 mb-2.5 text-[10px]">
                <div className={`p-1 border text-center ${activeStep >= 1 ? 'border-emerald-500 bg-emerald-950 text-emerald-300 font-bold' : 'border-stone-800 text-stone-500'}`}>
                  1. Parse Input
                </div>
                <div className={`p-1 border text-center ${activeStep >= 2 ? 'border-emerald-500 bg-emerald-950 text-emerald-300 font-bold' : 'border-stone-800 text-stone-500'}`}>
                  2. Gemini AI
                </div>
                <div className={`p-1 border text-center ${activeStep >= 3 ? 'border-emerald-500 bg-emerald-950 text-emerald-300 font-bold' : 'border-stone-800 text-stone-500'}`}>
                  3. JSON Schema
                </div>
                <div className={`p-1 border text-center ${activeStep >= 4 ? 'border-emerald-500 bg-emerald-950 text-emerald-300 font-bold' : 'border-stone-800 text-stone-500'}`}>
                  4. HTML Download
                </div>
              </div>
            )}

            <div className="max-h-36 overflow-y-auto space-y-1 text-stone-300 text-[11px] leading-relaxed bg-[#0B0F17] p-2.5 border border-stone-800">
              {terminalLogs.length === 0 ? (
                <p className="text-stone-500 italic">
                  Python background engine is ready. Upload your resume and click "Generate &amp; Download Portfolio" to begin.
                </p>
              ) : (
                terminalLogs.map((log, i) => (
                  <p 
                    key={i} 
                    className={
                      log.startsWith('[ERROR]') ? 'text-rose-400 font-bold' :
                      log.startsWith('[SUCCESS]') || log.startsWith('[COMPLETE]') ? 'text-emerald-400 font-bold' :
                      log.startsWith('[STEP') ? 'text-amber-300 font-semibold' :
                      'text-stone-300'
                    }
                  >
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>

          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border-2 border-rose-300 text-rose-900 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMessage}</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
