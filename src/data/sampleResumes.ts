export interface SampleResume {
  id: string;
  name: string;
  role: string;
  tagline: string;
  text: string;
}

export const SAMPLE_RESUMES: SampleResume[] = [
  {
    id: 'fullstack-lead',
    name: 'Alex Rivera',
    role: 'Principal Full-Stack & Distributed Systems Architect',
    tagline: 'High-scale web platforms, distributed cloud microservices, and reactive UIs.',
    text: `ALEX RIVERA
San Francisco, CA • alex.rivera.dev@gmail.com • (415) 555-0192
GitHub: github.com/alexrivera-cloud • LinkedIn: linkedin.com/in/alexrivera-lead

EXECUTIVE PROFILE
Principal Full-Stack & Cloud Architect with 8+ years of experience designing high-throughput distributed microservices, scalable frontend web applications, and developer platforms. Proven track record of scaling platforms from 10k to 50M+ daily active requests with 99.99% uptime.

TECHNICAL CORE COMPETENCIES
- Core Languages: TypeScript, JavaScript, Python, Go, SQL, HTML5/CSS3
- Frameworks & UI: React, Next.js, FastAPI, Node.js, Express, Tailwind CSS, GraphQL
- Cloud & Infrastructure: Google Cloud Platform (GCP), AWS, Kubernetes, Docker, Terraform, Kafka, Redis
- Databases: PostgreSQL, MongoDB, Redis, Firestore, Cassandra
- Architecture: Microservices, Event-Driven Architecture, CI/CD Pipelines, High-Availability Systems

LANDMARK PROJECTS

HyperScale GraphQL Gateway
- Architected an enterprise-grade federated GraphQL gateway processing 65M+ daily requests with sub-18ms latency.
- Technologies: Go, GraphQL, Redis Cluster, Docker, GCP Cloud Run
- Metrics: ⚡ 65M+ daily requests, -42% cloud infrastructure costs
- Link: https://github.com/alexrivera-cloud/hyperscale-gateway

Real-Time Collaborative Code Studio
- Developed an interactive browser IDE featuring multi-cursor collaborative editing, sandboxed WebContainer execution, and AI code generation.
- Technologies: React, TypeScript, WebSockets, Node.js, Tailwind CSS, Gemini API
- Metrics: ⭐ 3.8k GitHub stars, 45,000+ active monthly developers
- Link: https://demo-codestudio.io

Automated FinTech Payment Reconciliation Engine
- Engineered an automated double-entry ledger and ledger audit pipeline processing $120M+ in quarterly transactions with zero ledger discrepancies.
- Technologies: Python, FastAPI, PostgreSQL, Apache Kafka, AWS ECS
- Metrics: 📈 $120M+ processed quarterly, 99.999% data consistency

PROFESSIONAL EXPERIENCE

Principal Staff Engineer | Vertex Cloud Technologies (2022 — Present)
- Lead architecture across 4 engineering teams (28 engineers) building multi-tenant SaaS infrastructure.
- Re-architected legacy monolith into event-driven microservices, reducing P99 latency from 420ms to 45ms.
- Mentored 12 senior and staff engineers in distributed systems design and site reliability.

Senior Full-Stack Engineer | Horizon Interactive (2019 — 2022)
- Built real-time analytics dashboard rendering live telemetry metrics for 1,200+ enterprise clients.
- Authored custom React component library utilized across 8 production applications.

EDUCATION & CERTIFICATIONS
- B.S. in Computer Science — University of California, Berkeley (2018)
- Google Cloud Certified Professional Cloud Architect (2023)
- AWS Certified Solutions Architect Professional (2022)

AWARDS & RECOGNITIONS
- Speaker at CloudNative Con 2023: "Scaling Microservices with Zero-Trust Security"
- 1st Place Winner, Global FinTech Hackathon 2022`
  },
  {
    id: 'ai-researcher',
    name: 'Dr. Elena Vance',
    role: 'Staff AI Research & Applied LLM Engineer',
    tagline: 'Generative AI architectures, multimodal inference, and agentic workflows.',
    text: `DR. ELENA VANCE
Seattle, WA • elena.vance.ai@gmail.com • (206) 555-0841
GitHub: github.com/elenavance-ai • LinkedIn: linkedin.com/in/drelenavance

PROFESSIONAL SUMMARY
Staff AI Researcher and Applied LLM Engineer specializing in generative AI agent architectures, multimodal reasoning systems, and low-latency inference optimization. Author of 6 peer-reviewed papers in top AI venues (NeurIPS, ICML).

CORE SKILLS
- AI & ML: PyTorch, JAX, Transformers, vLLM, TensorRT-LLM, LangChain, LlamaIndex, Gemini API
- Languages: Python, C++, CUDA, TypeScript, SQL
- MLOps & Systems: Ray, Kubernetes, MLflow, Weights & Biases, Triton Inference Server, AWS SageMaker
- Data Engineering: Apache Spark, Vector Databases (Pinecone, Qdrant, Milvus), DuckDB

KEY PROJECTS & ARCHITECTURES

Agentic Multi-Modal Research Assistant (OmniSearch AI)
- Built an autonomous multi-modal deep research agent capable of reading PDFs, cross-referencing citations, and generating verified syntheses.
- Technologies: Python, PyTorch, Gemini Flash, Vector DB (Qdrant), FastAPI
- Metrics: 🔬 89.4% factual accuracy on benchmark evals, 150k+ research papers processed
- Link: https://github.com/elenavance-ai/omnisearch-agent

FlashInference: Quantized KV-Cache Engine
- Designed custom CUDA kernels for 4-bit KV cache compression during long-context LLM generation, speeding up throughput by 2.8x.
- Technologies: C++, CUDA, PyTorch, Triton
- Metrics: 🚀 2.8x throughput increase, 60% GPU VRAM reduction

EXPERIENCE

Staff AI Engineer | DeepIntelligence Labs (2021 — Present)
- Spearheaded development of multimodal retrieval-augmented generation (RAG) models for enterprise knowledge bases.
- Reduced model latency from 1.4s to 180ms per query utilizing speculative decoding and KV caching.

Machine Learning Researcher | Stanford AI Lab (2018 — 2021)
- Conducted doctoral research on self-supervised representation learning in multimodal foundation models.

EDUCATION
- Ph.D. in Computer Science (Artificial Intelligence) — Stanford University (2021)
- B.S. in Mathematics and Computer Science — MIT (2016)

PUBLICATIONS & AWARDS
- NeurIPS 2023 Best Paper Spotlight: "Efficient Long-Context Attention via Sparse Multimodal Routing"
- NSF Graduate Research Fellowship Recipient (2017)`
  },
  {
    id: 'product-designer',
    name: 'Chloe Dubois',
    role: 'Lead UI/UX Engineer & Design Systems Architect',
    tagline: 'Crafting accessible, pixel-perfect design systems and fluid micro-interactions.',
    text: `CHLOE DUBOIS
New York, NY • chloe.dubois.design@gmail.com • (917) 555-0322
Portfolio: chloedubois.design • GitHub: github.com/chloedubois • LinkedIn: linkedin.com/in/chloedubois

SUMMARY
Lead Design Technologist and Frontend Architect with 7+ years blending typography, accessibility standards (WCAG AAA), and motion design into high-conversion digital experiences.

CORE EXPERTISE
- Design & Prototyping: Figma, Design Tokens, Design Systems, Framer, Motion Design
- Frontend Engineering: React, Next.js, TypeScript, Tailwind CSS, Radix UI, Motion, WebGL / Three.js
- Tooling: Storybook, Chromatic, Style Dictionary, Jest, Playwright

FEATURED WORK

Aura: Cross-Platform Enterprise Design System
- Engineered unified design token pipeline and 60+ accessible UI components deployed across 14 web & mobile products.
- Technologies: React, TypeScript, Tailwind CSS, Storybook, Figma REST API
- Metrics: 🎨 60+ components, 100% WCAG AA compliance, +35% faster product rollout
- Link: https://aura-design-system.io

CanvasFlow: Interactive Spatial Whiteboard
- Designed an ultra-smooth infinite canvas whiteboard with physics-based gesture navigation and collaborative sketching.
- Technologies: React, TypeScript, HTML5 Canvas, Motion, WebSockets
- Metrics: ⭐ 2.1k GitHub stars, 60fps steady rendering with 10k nodes

EXPERIENCE

Lead Design Technologist | Prisma Studio (2021 — Present)
- Lead UI/UX architecture and front-end engineering for enterprise creative tools.
- Increased user task completion rates by 28% through iterative usability testing and design token standardization.

Senior UI Engineer | Kinetic Digital (2018 — 2021)
- Crafted bespoke e-commerce and editorial brand experiences for Fortune 500 fashion & tech clients.

EDUCATION
- B.F.A. in Interactive Media & Interaction Design — Rhode Island School of Design (RISD) (2018)`
  }
];
