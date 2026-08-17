import React, { useState } from 'react';
import { 
  User, 
  FolderKanban, 
  Cpu, 
  Briefcase, 
  Sparkles, 
  Quote, 
  Plus, 
  Trash2, 
  Star, 
  ExternalLink, 
  Github, 
  Layers, 
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { PortfolioData, ProjectItem, ExperienceItem, ServiceItem, TestimonialItem } from '../types';

interface PortfolioEditorProps {
  portfolioData: PortfolioData;
  onChange: (updated: PortfolioData) => void;
  onOpenAIGenerator: () => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  portfolioData,
  onChange,
  onOpenAIGenerator,
}) => {
  const [activeSection, setActiveSection] = useState<'profile' | 'projects' | 'skills' | 'experience' | 'services' | 'testimonials'>('projects');

  // Update profile basic info
  const handleProfileChange = (field: keyof PortfolioData, value: any) => {
    onChange({
      ...portfolioData,
      [field]: value
    });
  };

  // Update contact info
  const handleContactChange = (field: string, value: string) => {
    onChange({
      ...portfolioData,
      contact: {
        ...portfolioData.contact,
        [field]: value
      }
    });
  };

  // Projects Handlers
  const handleAddProject = () => {
    const newProject: ProjectItem = {
      id: `p_${Date.now()}`,
      title: 'New Featured Project',
      category: 'Full-Stack',
      tagline: 'High-impact web application architecture',
      description: 'Describe the core problem solved, system design, performance optimizations, and user impact.',
      metrics: '⚡ 10k+ active users • 99.9% uptime',
      techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
      liveUrl: 'https://example.com',
      githubUrl: 'https://github.com/example/repo',
      featured: true
    };
    onChange({
      ...portfolioData,
      projects: [newProject, ...portfolioData.projects]
    });
  };

  const handleUpdateProject = (index: number, field: keyof ProjectItem, value: any) => {
    const updated = [...portfolioData.projects];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange({
      ...portfolioData,
      projects: updated
    });
  };

  const handleDeleteProject = (index: number) => {
    const updated = portfolioData.projects.filter((_, i) => i !== index);
    onChange({
      ...portfolioData,
      projects: updated
    });
  };

  // Skills Handlers
  const handleAddSkillCategory = () => {
    onChange({
      ...portfolioData,
      skills: [
        ...portfolioData.skills,
        { category: 'New Competency Group', items: ['Tool 1', 'Tool 2', 'Tool 3'] }
      ]
    });
  };

  const handleUpdateSkillCategory = (catIndex: number, categoryName: string, itemsStr: string) => {
    const updated = [...portfolioData.skills];
    updated[catIndex] = {
      category: categoryName,
      items: itemsStr.split(',').map(s => s.trim()).filter(Boolean)
    };
    onChange({
      ...portfolioData,
      skills: updated
    });
  };

  const handleDeleteSkillCategory = (catIndex: number) => {
    onChange({
      ...portfolioData,
      skills: portfolioData.skills.filter((_, i) => i !== catIndex)
    });
  };

  // Experience Handlers
  const handleAddExperience = () => {
    const newExp: ExperienceItem = {
      id: `e_${Date.now()}`,
      role: 'Senior Engineer',
      company: 'Tech Innovations Inc.',
      duration: '2023 — Present',
      location: 'San Francisco, CA',
      description: 'Led engineering architecture and product delivery for high-scale services.',
      highlights: [
        'Accelerated feature velocity by 30% through modular component systems.',
        'Engineered real-time sync engine reducing latency.'
      ]
    };
    onChange({
      ...portfolioData,
      experience: [newExp, ...portfolioData.experience]
    });
  };

  const handleUpdateExperience = (index: number, field: keyof ExperienceItem, value: any) => {
    const updated = [...portfolioData.experience];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    onChange({
      ...portfolioData,
      experience: updated
    });
  };

  const handleDeleteExperience = (index: number) => {
    onChange({
      ...portfolioData,
      experience: portfolioData.experience.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#FDFCFB]">
      {/* Editor Sub-Navigation Sidebar */}
      <div className="w-full md:w-64 bg-[#FAF8F5] border-r border-stone-300 flex flex-col shrink-0">
        <div className="p-4 border-b border-stone-200">
          <p className="text-[10px] uppercase font-bold tracking-widest text-stone-500 font-mono">
            Builder Sections
          </p>
          <h2 className="text-sm font-serif font-bold italic text-[#1A1A1A]">
            Customize Portfolio
          </h2>
        </div>

        <div className="flex-1 p-2 space-y-1 overflow-y-auto">
          {[
            { id: 'projects', label: 'Featured Projects', icon: FolderKanban, count: portfolioData.projects.length },
            { id: 'profile', label: 'Hero & Identity', icon: User, count: null },
            { id: 'skills', label: 'Skills & Tech Stack', icon: Cpu, count: portfolioData.skills.length },
            { id: 'experience', label: 'Career Experience', icon: Briefcase, count: portfolioData.experience.length },
            { id: 'services', label: 'Services & Offerings', icon: Layers, count: portfolioData.services?.length || 0 },
            { id: 'testimonials', label: 'Endorsements', icon: Quote, count: portfolioData.testimonials?.length || 0 }
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xs text-xs font-semibold transition text-left border ${
                  isActive
                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-2xs'
                    : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-stone-500'}`} />
                  <span>{sec.label}</span>
                </div>
                {sec.count !== null && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-xs ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                  }`}>
                    {sec.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-3 bg-[#FAF8F5] border-t border-stone-200">
          <button
            onClick={onOpenAIGenerator}
            className="w-full flex items-center justify-center gap-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-3 py-2 rounded-xs text-xs font-bold transition shadow-2xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>AI Rewrite with Gemini</span>
          </button>
        </div>
      </div>

      {/* Editor Main Content Panels */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-white">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* SECTION 1: PROJECTS STUDIO */}
          {activeSection === 'projects' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
                <div>
                  <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">
                    Featured Projects Studio
                  </h3>
                  <p className="text-xs text-stone-600">
                    Add, edit, or highlight the landmark engineering & design projects on your portfolio.
                  </p>
                </div>
                <button
                  onClick={handleAddProject}
                  className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="space-y-5">
                {portfolioData.projects.map((project, idx) => (
                  <div 
                    key={project.id || idx}
                    className="bg-[#FAF8F5] border border-stone-300 rounded-xs p-5 space-y-4 relative hover:border-[#1A1A1A] transition shadow-2xs"
                  >
                    <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-bold text-stone-500">#{idx + 1}</span>
                        <input
                          type="text"
                          value={project.title}
                          onChange={(e) => handleUpdateProject(idx, 'title', e.target.value)}
                          placeholder="Project Title"
                          className="font-serif font-bold text-base bg-white border border-stone-300 px-2.5 py-1 rounded-xs text-[#1A1A1A] focus:outline-none focus:ring-1 focus:ring-[#1A1A1A] w-64"
                        />
                        <select
                          value={project.category}
                          onChange={(e) => handleUpdateProject(idx, 'category', e.target.value)}
                          className="text-xs font-mono bg-white border border-stone-300 px-2 py-1 rounded-xs text-stone-700"
                        >
                          <option value="Full-Stack">Full-Stack</option>
                          <option value="Systems & Cloud">Systems & Cloud</option>
                          <option value="AI & ML">AI & ML</option>
                          <option value="Mobile">Mobile</option>
                          <option value="UI/UX & Frontend">UI/UX & Frontend</option>
                          <option value="Open Source">Open Source</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateProject(idx, 'featured', !project.featured)}
                          className={`flex items-center gap-1 text-[11px] px-2 py-1 rounded-xs font-semibold border transition ${
                            project.featured 
                              ? 'bg-amber-100 text-amber-900 border-amber-300' 
                              : 'bg-white text-stone-500 border-stone-300'
                          }`}
                          title="Toggle featured showcase highlight"
                        >
                          <Star className={`w-3 h-3 ${project.featured ? 'fill-amber-600 text-amber-600' : ''}`} />
                          <span>{project.featured ? 'Featured' : 'Standard'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteProject(idx)}
                          className="text-stone-400 hover:text-rose-700 p-1 rounded-xs hover:bg-rose-50 transition"
                          title="Delete project"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Tagline & Metric */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                          Tagline / One-Liner
                        </label>
                        <input
                          type="text"
                          value={project.tagline}
                          onChange={(e) => handleUpdateProject(idx, 'tagline', e.target.value)}
                          placeholder="Real-time interactive architectural map"
                          className="w-full text-xs bg-white border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                          Impact Metric / Proof
                        </label>
                        <input
                          type="text"
                          value={project.metrics || ''}
                          onChange={(e) => handleUpdateProject(idx, 'metrics', e.target.value)}
                          placeholder="⚡ 50M+ requests / day • 99.99% uptime"
                          className="w-full text-xs font-mono bg-white border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                        Architecture & Engineering Narrative
                      </label>
                      <textarea
                        value={project.description}
                        onChange={(e) => handleUpdateProject(idx, 'description', e.target.value)}
                        rows={3}
                        placeholder="Detail the technical architecture, problem statement, and impact..."
                        className="w-full text-xs bg-white border border-stone-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none leading-relaxed"
                      />
                    </div>

                    {/* Tech Stack & Links */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                          Tech Stack (comma-separated)
                        </label>
                        <input
                          type="text"
                          value={(project.techStack || []).join(', ')}
                          onChange={(e) => handleUpdateProject(idx, 'techStack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          placeholder="TypeScript, React, Go, Kafka"
                          className="w-full text-xs font-mono bg-white border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                          Live Demo URL
                        </label>
                        <input
                          type="text"
                          value={project.liveUrl || ''}
                          onChange={(e) => handleUpdateProject(idx, 'liveUrl', e.target.value)}
                          placeholder="https://example.com"
                          className="w-full text-xs font-mono bg-white border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                          GitHub Repo URL
                        </label>
                        <input
                          type="text"
                          value={project.githubUrl || ''}
                          onChange={(e) => handleUpdateProject(idx, 'githubUrl', e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full text-xs font-mono bg-white border border-stone-300 p-2 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 2: HERO & PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#1A1A1A] pb-3">
                <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">
                  Hero & Professional Identity
                </h3>
                <p className="text-xs text-stone-600">
                  Define your personal brand, headline, bio statement, and primary contact channels.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1 font-mono">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={portfolioData.name}
                      onChange={(e) => handleProfileChange('name', e.target.value)}
                      className="w-full text-sm font-semibold bg-[#FAF8F5] border border-stone-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-600 mb-1 font-mono">
                      Location
                    </label>
                    <input
                      type="text"
                      value={portfolioData.location}
                      onChange={(e) => handleProfileChange('location', e.target.value)}
                      placeholder="San Francisco, CA &bull; Remote"
                      className="w-full text-sm bg-[#FAF8F5] border border-stone-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1 font-mono">
                    Professional Headline / Title
                  </label>
                  <input
                    type="text"
                    value={portfolioData.headline}
                    onChange={(e) => handleProfileChange('headline', e.target.value)}
                    placeholder="Senior Systems Architect & Distributed Cloud Lead"
                    className="w-full text-sm font-medium bg-[#FAF8F5] border border-stone-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1 font-mono">
                    Tagline / Value Proposition
                  </label>
                  <input
                    type="text"
                    value={portfolioData.tagline}
                    onChange={(e) => handleProfileChange('tagline', e.target.value)}
                    placeholder="Architecting resilient distributed systems and developer tooling."
                    className="w-full text-sm bg-[#FAF8F5] border border-stone-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1 font-mono">
                    Availability Status Badge
                  </label>
                  <input
                    type="text"
                    value={portfolioData.availability}
                    onChange={(e) => handleProfileChange('availability', e.target.value)}
                    placeholder="Available for Architecture Consulting & Select Advisory Roles"
                    className="w-full text-xs font-mono bg-[#FAF8F5] border border-stone-300 p-2.5 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-600 mb-1 font-mono">
                    Biography / Professional Narrative
                  </label>
                  <textarea
                    value={portfolioData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    rows={4}
                    className="w-full text-xs bg-[#FAF8F5] border border-stone-300 p-3 rounded-xs focus:ring-1 focus:ring-[#1A1A1A] focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Contact Links */}
                <div className="pt-4 border-t border-stone-200">
                  <h4 className="text-xs font-bold uppercase font-mono text-stone-700 mb-3">
                    Contact & Social Channels
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">Email</label>
                      <input
                        type="email"
                        value={portfolioData.contact?.email || ''}
                        onChange={(e) => handleContactChange('email', e.target.value)}
                        className="w-full text-xs font-mono bg-[#FAF8F5] border border-stone-300 p-2 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">GitHub URL</label>
                      <input
                        type="text"
                        value={portfolioData.contact?.github || ''}
                        onChange={(e) => handleContactChange('github', e.target.value)}
                        className="w-full text-xs font-mono bg-[#FAF8F5] border border-stone-300 p-2 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">LinkedIn URL</label>
                      <input
                        type="text"
                        value={portfolioData.contact?.linkedin || ''}
                        onChange={(e) => handleContactChange('linkedin', e.target.value)}
                        className="w-full text-xs font-mono bg-[#FAF8F5] border border-stone-300 p-2 rounded-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-mono text-stone-500 mb-1">Website URL</label>
                      <input
                        type="text"
                        value={portfolioData.contact?.website || ''}
                        onChange={(e) => handleContactChange('website', e.target.value)}
                        className="w-full text-xs font-mono bg-[#FAF8F5] border border-stone-300 p-2 rounded-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: SKILLS MATRIX */}
          {activeSection === 'skills' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
                <div>
                  <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">
                    Skills & Competency Matrix
                  </h3>
                  <p className="text-xs text-stone-600">
                    Group your technical capabilities into clear domains (Languages, Cloud, Databases, Tooling).
                  </p>
                </div>
                <button
                  onClick={handleAddSkillCategory}
                  className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Group</span>
                </button>
              </div>

              <div className="space-y-4">
                {portfolioData.skills.map((group, idx) => (
                  <div key={idx} className="bg-[#FAF8F5] border border-stone-300 rounded-xs p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        value={group.category}
                        onChange={(e) => handleUpdateSkillCategory(idx, e.target.value, group.items.join(', '))}
                        placeholder="Category Name"
                        className="font-bold text-xs uppercase font-mono bg-white border border-stone-300 px-2.5 py-1 rounded-xs text-[#1A1A1A]"
                      />
                      <button
                        onClick={() => handleDeleteSkillCategory(idx)}
                        className="text-stone-400 hover:text-rose-700 p-1"
                        title="Delete skill group"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                        Skills (comma-separated list)
                      </label>
                      <input
                        type="text"
                        value={group.items.join(', ')}
                        onChange={(e) => handleUpdateSkillCategory(idx, group.category, e.target.value)}
                        className="w-full text-xs font-mono bg-white border border-stone-300 p-2 rounded-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4: CAREER EXPERIENCE */}
          {activeSection === 'experience' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
                <div>
                  <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">
                    Career Milestones & Roles
                  </h3>
                  <p className="text-xs text-stone-600">
                    Document leadership positions, client engagements, and key quantifiable accomplishments.
                  </p>
                </div>
                <button
                  onClick={handleAddExperience}
                  className="flex items-center gap-1.5 bg-[#1A1A1A] hover:bg-stone-800 text-white px-3 py-1.5 rounded-xs text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Role</span>
                </button>
              </div>

              <div className="space-y-4">
                {portfolioData.experience.map((exp, idx) => (
                  <div key={exp.id || idx} className="bg-[#FAF8F5] border border-stone-300 rounded-xs p-5 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={exp.role}
                          onChange={(e) => handleUpdateExperience(idx, 'role', e.target.value)}
                          placeholder="Job Title"
                          className="font-bold text-sm bg-white border border-stone-300 px-2 py-1 rounded-xs"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => handleUpdateExperience(idx, 'company', e.target.value)}
                          placeholder="Company Name"
                          className="text-xs font-medium bg-white border border-stone-300 px-2 py-1 rounded-xs"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => handleUpdateExperience(idx, 'duration', e.target.value)}
                          placeholder="2022 — Present"
                          className="text-xs font-mono bg-white border border-stone-300 px-2 py-1 rounded-xs w-32"
                        />
                        <button
                          onClick={() => handleDeleteExperience(idx)}
                          className="text-stone-400 hover:text-rose-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase text-stone-500 mb-1">
                        Bullet Points (one per line)
                      </label>
                      <textarea
                        value={(exp.highlights || []).join('\n')}
                        onChange={(e) => handleUpdateExperience(idx, 'highlights', e.target.value.split('\n').filter(Boolean))}
                        rows={3}
                        className="w-full text-xs bg-white border border-stone-300 p-2 rounded-xs leading-relaxed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 5: SERVICES */}
          {activeSection === 'services' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#1A1A1A] pb-3">
                <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">
                  Services & Offerings
                </h3>
                <p className="text-xs text-stone-600">
                  Highlight advisory, consulting, architecture, or design services offered to clients and teams.
                </p>
              </div>

              <div className="space-y-4">
                {(portfolioData.services || []).map((srv, idx) => (
                  <div key={srv.id || idx} className="bg-[#FAF8F5] border border-stone-300 rounded-xs p-4 space-y-2">
                    <input
                      type="text"
                      value={srv.title}
                      onChange={(e) => {
                        const updated = [...(portfolioData.services || [])];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        onChange({ ...portfolioData, services: updated });
                      }}
                      className="font-bold text-sm bg-white border border-stone-300 p-2 rounded-xs w-full"
                    />
                    <textarea
                      value={srv.description}
                      onChange={(e) => {
                        const updated = [...(portfolioData.services || [])];
                        updated[idx] = { ...updated[idx], description: e.target.value };
                        onChange({ ...portfolioData, services: updated });
                      }}
                      rows={2}
                      className="text-xs bg-white border border-stone-300 p-2 rounded-xs w-full"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 6: TESTIMONIALS */}
          {activeSection === 'testimonials' && (
            <div className="space-y-6">
              <div className="border-b-2 border-[#1A1A1A] pb-3">
                <h3 className="text-xl font-serif font-bold italic text-[#1A1A1A]">
                  Testimonials & Endorsements
                </h3>
                <p className="text-xs text-stone-600">
                  Quotes from engineering leaders, product managers, or clients confirming your impact.
                </p>
              </div>

              <div className="space-y-4">
                {(portfolioData.testimonials || []).map((t, idx) => (
                  <div key={t.id || idx} className="bg-[#FAF8F5] border border-stone-300 rounded-xs p-4 space-y-2">
                    <textarea
                      value={t.quote}
                      onChange={(e) => {
                        const updated = [...(portfolioData.testimonials || [])];
                        updated[idx] = { ...updated[idx], quote: e.target.value };
                        onChange({ ...portfolioData, testimonials: updated });
                      }}
                      rows={2}
                      placeholder="Quote text..."
                      className="text-xs italic bg-white border border-stone-300 p-2 rounded-xs w-full"
                    />
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="text"
                        value={t.author}
                        placeholder="Author"
                        onChange={(e) => {
                          const updated = [...(portfolioData.testimonials || [])];
                          updated[idx] = { ...updated[idx], author: e.target.value };
                          onChange({ ...portfolioData, testimonials: updated });
                        }}
                        className="text-xs bg-white border border-stone-300 p-1.5 rounded-xs"
                      />
                      <input
                        type="text"
                        value={t.role}
                        placeholder="Role"
                        onChange={(e) => {
                          const updated = [...(portfolioData.testimonials || [])];
                          updated[idx] = { ...updated[idx], role: e.target.value };
                          onChange({ ...portfolioData, testimonials: updated });
                        }}
                        className="text-xs bg-white border border-stone-300 p-1.5 rounded-xs"
                      />
                      <input
                        type="text"
                        value={t.company}
                        placeholder="Company"
                        onChange={(e) => {
                          const updated = [...(portfolioData.testimonials || [])];
                          updated[idx] = { ...updated[idx], company: e.target.value };
                          onChange({ ...portfolioData, testimonials: updated });
                        }}
                        className="text-xs bg-white border border-stone-300 p-1.5 rounded-xs"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
