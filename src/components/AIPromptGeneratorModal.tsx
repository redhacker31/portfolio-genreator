import React, { useState } from 'react';
import { Sparkles, Wand2, X, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { PortfolioData } from '../types';

interface AIPromptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (data: PortfolioData) => void;
  currentData: PortfolioData;
}

const TEMPLATE_PROMPTS = [
  {
    title: "Senior Full-Stack Architect",
    text: "I am a Senior Full-Stack Architect with 8 years of experience building high-scale distributed web applications using TypeScript, React, Go, PostgreSQL, and Kubernetes. I built a microservice trace visualizer handling 50M requests/day and an open-source telemetry daemon with 2k stars."
  },
  {
    title: "AI & Machine Learning Engineer",
    text: "I am a Staff AI Engineer specializing in LLMs, RAG architectures, and multimodal computer vision. I have a PhD from Columbia, published at NeurIPS, and deployed multi-agent research tools with sub-5ms vector retrieval using PyTorch, Gemini, and Qdrant."
  },
  {
    title: "Creative Frontend & Product Designer",
    text: "I am a Principal Product Designer and Design Engineer crafting fluid motion systems, design tokens, and accessible component libraries. Built an enterprise design system used by 14 squads and an interactive canvas physics tool with 40k monthly users."
  }
];

export const AIPromptGeneratorModal: React.FC<AIPromptGeneratorModalProps> = ({
  isOpen,
  onClose,
  onGenerated,
  currentData,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please provide a prompt or description of your background and projects.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/generate-portfolio-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, currentData })
      });
      const result = await res.json();

      if (result.success && result.portfolioData) {
        onGenerated(result.portfolioData);
        onClose();
      } else {
        setError(result.error || 'Failed to generate portfolio. Please try again.');
      }
    } catch (err: any) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-[#FAF8F5] border-2 border-[#1A1A1A] rounded-xs shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-300 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xs bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800">
              <Wand2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold italic text-base text-[#1A1A1A]">
                AI Portfolio Generator
              </h3>
              <p className="text-[11px] text-stone-500 font-mono">
                Powered by Gemini &bull; Instant Project & Bio Extraction
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-stone-400 hover:text-black p-1 rounded-xs hover:bg-stone-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A] font-mono mb-1.5">
              Describe Your Background, Landmark Projects & Tech Stack
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Paste your raw bio, project notes, work history, or describe what you want in your portfolio..."
              rows={6}
              className="w-full text-xs font-mono bg-white border border-stone-300 p-3.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none leading-relaxed select-text"
            />
          </div>

          {/* Prompt Templates */}
          <div>
            <span className="block text-[11px] font-mono font-bold uppercase text-stone-500 mb-2">
              Or Choose a Starting Archetype Template:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {TEMPLATE_PROMPTS.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => setPrompt(t.text)}
                  className="text-left bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-500 p-2.5 rounded-xs text-xs transition"
                >
                  <span className="font-serif font-bold italic block text-[#1A1A1A] mb-1">
                    {t.title}
                  </span>
                  <span className="text-[10px] text-stone-600 line-clamp-2 leading-tight block">
                    {t.text}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-300 text-rose-800 p-3 rounded-xs text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-stone-300">
          <button
            onClick={onClose}
            className="text-xs font-medium text-stone-600 hover:text-black px-3 py-1.5"
          >
            Cancel
          </button>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="flex items-center gap-2 bg-[#1A1A1A] hover:bg-stone-800 text-white px-5 py-2.5 rounded-xs text-xs font-bold uppercase tracking-wider shadow-xs disabled:opacity-50 transition cursor-pointer"
          >
            <Sparkles className={`w-4 h-4 text-amber-300 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Generating Portfolio with Gemini...' : 'Generate Full Portfolio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
