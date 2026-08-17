export type PortfolioTheme = 'editorial' | 'minimal' | 'terminal' | 'bento';

export interface ProjectItem {
  id: string;
  title: string;
  category: 'Full-Stack' | 'AI & ML' | 'Mobile' | 'Systems & Cloud' | 'UI/UX & Frontend' | 'Open Source';
  tagline: string;
  description: string;
  metrics?: string; // e.g. "50M+ API requests / day", "1.4k GitHub Stars"
  techStack: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured?: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  duration: string;
  location?: string;
  description?: string;
  highlights: string[];
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  year: string;
  details?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  tags?: string[];
}

export interface TestimonialItem {
  id: string;
  quote: string;
  author: string;
  role: string;
  company: string;
}

export interface PortfolioData {
  name: string;
  headline: string;
  tagline: string;
  bio: string;
  location: string;
  availability: string;
  contact: {
    email: string;
    phone?: string;
    github?: string;
    linkedin?: string;
    twitter?: string;
    website?: string;
  };
  skills: {
    category: string;
    items: string[];
  }[];
  projects: ProjectItem[];
  experience: ExperienceItem[];
  education: EducationItem[];
  services: ServiceItem[];
  testimonials: TestimonialItem[];
  achievements: string[];
  theme: PortfolioTheme;
}

export interface FileMap {
  [filename: string]: string;
}
