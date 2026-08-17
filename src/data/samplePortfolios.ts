import { PortfolioData } from '../types';

export const SAMPLE_PORTFOLIOS: Record<string, PortfolioData> = {
  systems_architect: {
    name: "Alexander Sterling",
    headline: "Senior Systems Architect & Cloud Infrastructure Lead",
    tagline: "Architecting resilient distributed systems, sub-millisecond cloud pipelines, and developer tooling.",
    bio: "Senior Systems Architect with 8+ years of experience engineering high-throughput distributed services and web applications. Passionate about event-driven architectures, low-latency telemetry, resilient databases, and clean developer workflows.",
    location: "San Francisco, CA",
    availability: "Available for Architecture Consulting & Select Advisory Roles",
    contact: {
      email: "alex.sterling.dev@example.com",
      phone: "+1 (555) 234-5678",
      github: "https://github.com/asterling-demo",
      linkedin: "https://linkedin.com/in/asterling-demo",
      twitter: "https://x.com/asterling_dev",
      website: "https://alexsterling.design"
    },
    skills: [
      {
        category: "Core Languages",
        items: ["Go", "Python", "TypeScript", "Rust", "SQL", "C++"]
      },
      {
        category: "Distributed Systems & Cloud",
        items: ["Kubernetes", "Docker", "GCP", "AWS", "Terraform", "Kafka", "Redis Pub/Sub", "gRPC"]
      },
      {
        category: "Databases & Storage",
        items: ["PostgreSQL", "ClickHouse", "Redis", "MongoDB", "DynamoDB", "S3"]
      },
      {
        category: "Frontend & Tooling",
        items: ["React", "Next.js", "Tailwind CSS", "D3.js", "GraphQL", "WebSockets", "Prometheus"]
      }
    ],
    projects: [
      {
        id: "p1",
        title: "OpenGraph Visualizer",
        category: "Systems & Cloud",
        tagline: "Real-time interactive architectural map for 500+ microservices",
        description: "Built a high-performance distributed microservice dependency mapper that analyzes distributed OpenTelemetry traces in real-time. Features automated bottleneck detection, latency heatmaps, and zero-overhead eBPF probes.",
        metrics: "⚡ 50M+ traces analyzed / day • 99.99% uptime",
        techStack: ["Go", "React", "D3.js", "WebSockets", "eBPF", "ClickHouse"],
        liveUrl: "https://opengraph-demo.example.com",
        githubUrl: "https://github.com/asterling-demo/opengraph-visualizer",
        featured: true
      },
      {
        id: "p2",
        title: "TaskPulse Engine",
        category: "Full-Stack",
        tagline: "Real-time collaborative planning & state synchronization engine",
        description: "Engineered a conflict-free replicated data type (CRDT) engine powering sub-15ms multi-user document collaboration and Kanban workflows. Features offline optimistic mutation rollbacks and end-to-end payload encryption.",
        metrics: "🚀 Sub-15ms global sync • 120k Monthly Active Users",
        techStack: ["TypeScript", "React", "Node.js", "Yjs / CRDT", "PostgreSQL", "Tailwind CSS"],
        liveUrl: "https://taskpulse.example.com",
        githubUrl: "https://github.com/asterling-demo/taskpulse",
        featured: true
      },
      {
        id: "p3",
        title: "CloudMetrics Telemetry",
        category: "Open Source",
        tagline: "Ultra-lightweight host telemetry agent with sub-5MB memory footprint",
        description: "An open-source server metrics daemon engineered in Rust and Go that scrapes CPU, memory, socket buffers, and disk I/O with negligible overhead, streaming directly to time-series backends.",
        metrics: "⭐ 1.8k GitHub Stars • < 4MB RAM overhead",
        techStack: ["Rust", "Go", "Prometheus", "Docker", "Grafana API"],
        liveUrl: "https://cloudmetrics.example.com",
        githubUrl: "https://github.com/asterling-demo/cloudmetrics",
        featured: false
      },
      {
        id: "p4",
        title: "HyperQueue Broker",
        category: "Systems & Cloud",
        tagline: "In-memory message broker with persistent write-ahead logging",
        description: "Designed a partitioned pub/sub message broker capable of handling 2.4 million persistent messages per second per node with disk-backed write-ahead logs and zero garbage collection pauses.",
        metrics: "⚡ 2.4M msg/sec throughput • P99 latency < 0.8ms",
        techStack: ["Go", "RocksDB", "gRPC", "Protobuf", "Linux IO_uring"],
        githubUrl: "https://github.com/asterling-demo/hyperqueue",
        featured: false
      }
    ],
    experience: [
      {
        id: "e1",
        role: "Lead Systems Architect",
        company: "QuantumFlow Technologies",
        duration: "2022 — Present",
        location: "San Francisco, CA",
        description: "Directing architectural strategy for global data infrastructure serving 50M+ daily transactions.",
        highlights: [
          "Architected distributed microservices platform reducing cross-region data egress costs by 38% ($420k/yr).",
          "Spearheaded real-time telemetry streaming migration using WebSockets and Redis Pub/Sub, dropping end-to-end data lag to under 300ms.",
          "Mentored a team of 8 engineers and introduced automated architectural review RFC processes."
        ]
      },
      {
        id: "e2",
        role: "Senior Backend & Infrastructure Engineer",
        company: "Nexus Labs Inc.",
        duration: "2019 — 2022",
        location: "Seattle, WA",
        description: "Engineered scalable GraphQL/REST microservices and CI/CD infrastructure.",
        highlights: [
          "Designed multi-tenant PostgreSQL partitioning strategy scaling to 10TB+ dataset with zero downtime.",
          "Built automated staging environments with Kubernetes and GitHub Actions, accelerating pull request verification."
        ]
      }
    ],
    education: [
      {
        id: "ed1",
        degree: "Master of Science in Computer Science",
        institution: "Stanford University",
        year: "2019",
        details: "Specialization in Distributed Computing & Systems Architecture. GPA 3.9/4.0."
      },
      {
        id: "ed2",
        degree: "Bachelor of Science in Software Engineering",
        institution: "MIT",
        year: "2017",
        details: "Graduated with Honors. President of the Distributed Systems Society."
      }
    ],
    services: [
      {
        id: "s1",
        title: "Distributed Systems Architecture",
        description: "Designing fault-tolerant, high-throughput backend infrastructure, microservices decomposition, and cloud cost optimization.",
        tags: ["Kubernetes", "gRPC", "GCP/AWS", "Kafka"]
      },
      {
        id: "s2",
        title: "Full-Stack Web Engineering",
        description: "Building production-grade web applications with modern React, TypeScript, and high-performance API layers.",
        tags: ["React", "Next.js", "Node.js", "PostgreSQL"]
      },
      {
        id: "s3",
        title: "Performance & Reliability Audits",
        description: "Profiling system bottlenecks, database indexing, query optimization, and latency reduction for enterprise systems.",
        tags: ["Profiling", "eBPF", "Database Tuning", "SRE"]
      }
    ],
    testimonials: [
      {
        id: "t1",
        quote: "Alexander rebuilt our core data pipelines from the ground up. He delivered a 4x throughput boost while cutting our cloud bill in half. An extraordinary systems thinker.",
        author: "Sarah Chen",
        role: "VP of Engineering",
        company: "QuantumFlow Technologies"
      },
      {
        id: "t2",
        quote: "Working with Alexander on open-source infrastructure is a masterclass in clean API design and rock-solid reliability.",
        author: "Devon Reed",
        role: "Principal SRE",
        company: "OpenMesh Foundation"
      }
    ],
    achievements: [
      "Innovator of the Year — Pacific Regional Technology Summit (2022)",
      "Google Cloud Certified Professional Cloud Architect (2023)",
      "Co-author of Patent: Distributed Cache Synchronization for High-Throughput Relational Databases",
      "Speaker at KubeCon North America on eBPF Microservice Observability"
    ],
    theme: "editorial"
  },

  ai_researcher: {
    name: "Dr. Elena Rostova",
    headline: "Staff AI Engineer & Generative Systems Specialist",
    tagline: "Bridging the frontier between foundation multimodal models and production AI products.",
    bio: "AI Engineer and Machine Learning researcher with a PhD in Applied Mathematics. Specializing in multimodal model fine-tuning, retrieval-augmented generation (RAG), and agentic workflows that solve complex domain challenges.",
    location: "New York, NY",
    availability: "Accepting AI Advisory & Research Collaboration",
    contact: {
      email: "elena.rostova.ai@example.com",
      github: "https://github.com/elena-rostova-ml",
      linkedin: "https://linkedin.com/in/elena-rostova-ai",
      twitter: "https://x.com/elena_rostova_ai",
      website: "https://rostova.ai"
    },
    skills: [
      {
        category: "Machine Learning & AI",
        items: ["PyTorch", "Transformers", "vLLM", "TensorRT", "LoRA / QLoRA", "LangChain", "LlamaIndex"]
      },
      {
        category: "Languages & Frameworks",
        items: ["Python", "C++", "CUDA", "FastAPI", "TypeScript", "React", "Triton"]
      },
      {
        category: "Data & Inference Ops",
        items: ["Pinecone", "Qdrant", "Chroma", "Ray", "Triton Inference Server", "MLflow", "Docker", "SageMaker"]
      }
    ],
    projects: [
      {
        id: "p1",
        title: "OmniSynth Agentic Hub",
        category: "AI & ML",
        tagline: "Autonomous multi-agent research assistant with tool execution & live verification",
        description: "Created an autonomous research synthesis agent powered by Gemini 2.5 and Flash models that parses 100+ page scientific PDFs, validates citations, and constructs verified synthesis briefs.",
        metrics: "📚 200k+ research papers indexed • 94.2% factual precision",
        techStack: ["Python", "PyTorch", "Gemini 2.5", "Qdrant", "FastAPI", "React"],
        liveUrl: "https://omnisynth.example.com",
        githubUrl: "https://github.com/elena-rostova-ml/omnisynth",
        featured: true
      },
      {
        id: "p2",
        title: "MedBERT-BioVision",
        category: "Open Source",
        tagline: "Open-source multimodal clinical pathology entity extractor",
        description: "Pre-trained vision-language model for automated histological report classification. Achieved SOTA benchmark performance on medical entity extraction challenges.",
        metrics: "⭐ 3.2k GitHub Stars • 80k+ Hugging Face Downloads",
        techStack: ["PyTorch", "Hugging Face", "CUDA", "FastAPI", "Docker"],
        liveUrl: "https://huggingface.co/models/medbert-biovision",
        githubUrl: "https://github.com/elena-rostova-ml/medbert-biovision",
        featured: true
      },
      {
        id: "p3",
        title: "Kinetics-Embedding Engine",
        category: "AI & ML",
        tagline: "Sub-5ms vector search inference engine for dense spatial embeddings",
        description: "Engineered a SIMD-accelerated C++ vector index wrapper with hardware-level AVX-512 optimizations for ultra-fast nearest-neighbor similarity querying.",
        metrics: "⚡ 50,000 queries/sec • < 2ms latency",
        techStack: ["C++", "CUDA", "AVX-512", "Python bindings", "FastAPI"],
        githubUrl: "https://github.com/elena-rostova-ml/kinetics-embeddings",
        featured: false
      }
    ],
    experience: [
      {
        id: "e1",
        role: "Staff AI Engineer",
        company: "Synthetix Applied Research",
        duration: "2021 — Present",
        location: "New York, NY",
        description: "Leading foundation model deployment and low-latency inference pipelines.",
        highlights: [
          "Optimized transformer inference throughput by 3.2x using TensorRT-LLM and speculative decoding.",
          "Published 3 papers on multimodal retrieval augmentation at NeurIPS and CVPR."
        ]
      }
    ],
    education: [
      {
        id: "ed1",
        degree: "Ph.D. in Applied Mathematics & Machine Learning",
        institution: "Columbia University",
        year: "2021",
        details: "Doctoral dissertation on Neural Differential Equations and Sparse Attention."
      }
    ],
    services: [
      {
        id: "s1",
        title: "LLM & Agent System Design",
        description: "Architecting custom agentic architectures, tool-calling pipelines, and reliable RAG vector workflows.",
        tags: ["Gemini API", "RAG", "Agent Orchestration"]
      },
      {
        id: "s2",
        title: "Model Fine-Tuning & Quantization",
        description: "Domain adaptation using LoRA, instruction tuning, and TensorRT deployment for low-latency inference.",
        tags: ["PyTorch", "LoRA", "TensorRT"]
      }
    ],
    testimonials: [
      {
        id: "t1",
        quote: "Elena combines rigorous theoretical deep learning expertise with an extraordinary ability to ship production systems.",
        author: "Marcus Brody",
        role: "Chief Scientist",
        company: "Synthetix AI"
      }
    ],
    achievements: [
      "NeurIPS Best Paper Spotlight (2023)",
      "NSF Graduate Research Fellowship recipient",
      "Kaggle Grandmaster in Computer Vision & NLP"
    ],
    theme: "editorial"
  },

  product_designer: {
    name: "Maya Lin",
    headline: "Principal Product Designer & Design Engineer",
    tagline: "Crafting fluid, human-centric interfaces, motion systems, and accessible design ecosystems.",
    bio: "Design technologist and product designer with 7+ years of experience shaping design systems and consumer web applications. Obsessed with typography, optical balance, micro-interactions, and high-fidelity prototypes.",
    location: "Tokyo & Remote",
    availability: "Available for Q3/Q4 Design Engagements",
    contact: {
      email: "maya.lin.design@example.com",
      github: "https://github.com/mayalin-design",
      linkedin: "https://linkedin.com/in/mayalin-design",
      twitter: "https://x.com/mayalin_ui",
      website: "https://mayalin.design"
    },
    skills: [
      {
        category: "Product & UI/UX Design",
        items: ["Design Systems", "Figma", "Design Tokens", "User Research", "Interaction Design", "Prototyping"]
      },
      {
        category: "Design Engineering & Code",
        items: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "CSS Architecture", "Storybook", "SVG / Canvas"]
      },
      {
        category: "Methodologies",
        items: ["Design Thinking", "Accessibility (WCAG 2.1 AAA)", "Design Sprint Facilitation", "Information Architecture"]
      }
    ],
    projects: [
      {
        id: "p1",
        title: "Atelier Design System",
        category: "UI/UX & Frontend",
        tagline: "Multi-brand design system with 60+ accessible component primitives",
        description: "Crafted a comprehensive, enterprise-grade design system utilized across 14 product teams. Includes semantic color tokens, mathematical typography scaling, and keyboard-first accessibility.",
        metrics: "✨ Adopted by 14 product squads • WCAG AAA compliant",
        techStack: ["React", "TypeScript", "Tailwind CSS", "Storybook", "Radix UI", "Figma Tokens"],
        liveUrl: "https://atelier-design.example.com",
        githubUrl: "https://github.com/mayalin-design/atelier-ui",
        featured: true
      },
      {
        id: "p2",
        title: "Kinetic Canvas Studio",
        category: "Open Source",
        tagline: "Interactive spring-physics motion curve playground for creative developers",
        description: "Interactive visual tool for crafting, tuning, and exporting fluid spring physics curves and Bézier transitions directly to CSS keyframes and Framer Motion code.",
        metrics: "⭐ 2.4k GitHub Stars • 45k monthly web users",
        techStack: ["TypeScript", "Canvas API", "React", "Framer Motion", "Tailwind CSS"],
        liveUrl: "https://kinetic-canvas.example.com",
        githubUrl: "https://github.com/mayalin-design/kinetic-canvas",
        featured: true
      },
      {
        id: "p3",
        title: "Forma Spatial Interface",
        category: "UI/UX & Frontend",
        tagline: "Experimental spatial workspace interface for infinite canvas ideation",
        description: "Conducted user research and designed an infinite canvas spatial workspace allowing teams to organize notes, design assets, and video streams seamlessly.",
        metrics: "🏆 Red Dot Design Award 2023 Winner",
        techStack: ["Figma", "React", "WebGL", "TypeScript", "Tailwind CSS"],
        liveUrl: "https://forma-spatial.example.com",
        githubUrl: "https://github.com/mayalin-design/forma-spatial",
        featured: false
      }
    ],
    experience: [
      {
        id: "e1",
        role: "Principal Product Designer",
        company: "Form & Function Studio",
        duration: "2022 — Present",
        location: "Tokyo, Japan",
        description: "Leading design systems and user experience strategy for global SaaS clients.",
        highlights: [
          "Standardized design token architecture across iOS, Android, and Web platforms.",
          "Spearheaded user research initiatives that improved client task completion rates by 34%."
        ]
      }
    ],
    education: [
      {
        id: "ed1",
        degree: "Bachelor of Fine Arts in Interaction Design",
        institution: "Rhode Island School of Design (RISD)",
        year: "2018",
        details: "Graduated with Honors in Design & Human-Computer Interaction."
      }
    ],
    services: [
      {
        id: "s1",
        title: "Design System Architecture",
        description: "Building production-ready tokenized design systems in Figma and React code with thorough documentation.",
        tags: ["Figma", "Tokens", "React", "Accessibility"]
      },
      {
        id: "s2",
        title: "High-Fidelity Product Prototyping",
        description: "Translating complex product requirements into tactile, interactive prototypes with responsive physics.",
        tags: ["Interaction Design", "Motion", "Tailwind CSS"]
      }
    ],
    testimonials: [
      {
        id: "t1",
        quote: "Maya possesses that rare dual superpower: immaculate visual taste combined with the technical engineering chops to build it in production.",
        author: "Kenji Sato",
        role: "Head of Product",
        company: "Kuro Digital"
      }
    ],
    achievements: [
      "Red Dot Design Concept Award Winner (2023)",
      "Speaker at Design Systems London 2024",
      "Featured on Awwwards Site of the Day"
    ],
    theme: "editorial"
  }
};
