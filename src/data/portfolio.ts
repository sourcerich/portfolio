/* =============================================================================
   Portfolio content — single source of truth
   -----------------------------------------------------------------------------
   Real data, migrated from the previous Nuxt site (sourcerich.github.io).
   Components import from here; nothing is hard-coded in markup. Template-only
   filler from the old site (the fictional "speaking" talks, stock Unsplash
   "about" photos) was intentionally dropped — only genuine content remains.
   ========================================================================== */

import type { ImageMetadata } from 'astro';

// Imported from src/ so Astro's <Image> can optimize them at build time
// (resize + WebP). Files in public/ would ship unprocessed, so they live here.
import sankalpImg from '../assets/projects/sankalp.png';
import ragImg from '../assets/projects/rag.webp';
import sunspotsImg from '../assets/projects/sunspots.jpg';
import scraperImg from '../assets/projects/scraper.jpg';
import amizoneImg from '../assets/projects/Flutter.webp';
import jotrImg from '../assets/projects/jotr.jpeg';

export interface SocialLink {
  label: string;
  href: string;
}

export interface Project {
  title: string;
  description: string;
  image: ImageMetadata;
  /** External link, or null when there's nothing public to link to yet. */
  url: string | null;
  tags: string[];
  year: string;
  /** A single standout, real result — shown prominently on the card. */
  metric?: { value: string; label: string };
}

export interface ExperienceItem {
  role: string;
  company: string;
  period: string;
  summary: string;
}

export interface Testimonial {
  quote: string;
  name: string;
  title: string;
  avatar: string;
}

export interface SkillGroup {
  label: string;
  items: string[];
}

/* --- Identity ------------------------------------------------------------ */
export const profile = {
  name: 'Richie Patil',
  firstName: 'Richie',
  lastName: 'Patil',
  role: 'Backend & ML Engineer',
  location: 'Mumbai, India',
  available: true,
  email: 'richiepatilwork@gmail.com',
  resumeUrl: '/richie-patil-resume.pdf',
  meetingLink: 'https://cal.com/richie-patil',
  /** One-line subhead — derived from his real positioning. */
  tagline:
    'I engineer robust backend systems and intelligent ML solutions — robust APIs, data pipelines, and applied generative AI.',
};

export const socials: SocialLink[] = [
  { label: 'GitHub', href: 'https://github.com/sourcerich' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/richiepatil/' },
  { label: 'Discord', href: 'https://discord.com/users/384929346303033356' },
];

/* --- Work / projects ----------------------------------------------------- */
export const workIntro = {
  kicker: 'Selected Work',
  title: 'Building systems, solving problems.',
  lead: 'A range of projects across scalable backends and intelligent ML — from concept to deployment. A few highlights I’m proud of.',
};

export const projects: Project[] = [
  {
    title: 'Sankalp NGO Platform',
    description:
      'A high-performance, full-stack platform for the Sankalp NGO to manage certificates and user data at scale, with end-to-end encryption and DevSecOps deployment on a Linux VPS.',
    image: sankalpImg,
    url: 'https://thesankalp.org/',
    tags: ['React', 'Node.js', 'TypeScript', 'DevSecOps'],
    year: '2025',
    metric: { value: '1M+', label: 'certificates served' },
  },
  {
    title: 'RAG-based AI Decision Assistant',
    description:
      'A proprietary Retrieval-Augmented Generation system in Python/LangChain on AWS Lambda — real-time risk-document querying and automated decision support for enterprise teams.',
    image: ragImg,
    url: null,
    tags: ['Python', 'LangChain', 'AWS Lambda', 'RAG'],
    year: '2025',
    metric: { value: '90%', label: 'less manual review' },
  },
  {
    title: 'Solar Weather Prediction System',
    description:
      'Final-year dissertation: machine-learning models forecasting sunspot activity and space weather from astronomical time-series, using ensemble methods and rigorous validation.',
    image: sunspotsImg,
    url: null,
    tags: ['Machine Learning', 'Python', 'Data Science', 'Research'],
    year: '2024',
    metric: { value: '85%', label: 'prediction accuracy' },
  },
  {
    title: 'E-Commerce Analytics Scraper',
    description:
      'A scalable scraping tool monitoring product data across leading platforms, feeding an automated ETL pipeline and a Power BI dashboard for real-time market intelligence.',
    image: scraperImg,
    url: null,
    tags: ['Python', 'Selenium', 'BeautifulSoup', 'ETL', 'Power BI'],
    year: '2024',
    metric: { value: '10k+', label: 'products tracked daily' },
  },
  {
    title: 'Amizone Mobile App',
    description:
      'A Flutter app replicating Amity University’s student portal, reverse-engineering the portal APIs to give students fast, offline-capable mobile access to academic info.',
    image: amizoneImg,
    url: null,
    tags: ['Flutter', 'Dart', 'API Integration', 'Mobile'],
    year: '2023',
  },
  {
    title: 'Journey of the Ring',
    description:
      'A Lord of the Rings parody visual novel built in Ren’Py — branching interactive storytelling and multiple endings. A reminder that engineering can be playful.',
    image: jotrImg,
    url: null,
    tags: ['Ren’Py', 'Python', 'Game Dev', 'Interactive Fiction'],
    year: '2022',
  },
];

/* --- Experience ---------------------------------------------------------- */
export const experience: ExperienceItem[] = [
  {
    role: 'Backend Developer',
    company: 'Sunday Tech',
    period: 'Sep 2024 — Present',
    summary:
      'Designed backend APIs in Node.js/TypeScript across 5 SaaS products; re-architected hot paths to cut API latency by 99.7% (45s → 145ms) and automated client data-aggregation pipelines.',
  },
  {
    role: 'Backend Intern',
    company: 'Sunday Tech',
    period: 'Jun 2024 — Sep 2024',
    summary:
      'Resolved 20+ production-critical issues (17% better incident resolution) and authored integration docs for 25+ third-party services including Segment, Meta, Shopify and Google Analytics.',
  },
  {
    role: 'QA Intern',
    company: 'WNS Global Services',
    period: 'Jan 2024 — May 2024',
    summary:
      'Tested enterprise insurance and claims applications — surfaced 1,000+ issues and ran 450+ targeted test scenarios to harden stability ahead of deployment.',
  },
  {
    role: 'Data Science Intern',
    company: 'Celebal Technologies',
    period: 'Aug 2023 — Dec 2023',
    summary:
      'Ran EDA on 500,000+ customer records and ETL on 10GB+ of raw data with Python/Pandas; built supervised ML models that shaped two new marketing strategies.',
  },
];

/* --- About --------------------------------------------------------------- */
export const about = {
  paragraphs: [
    'I’m a Backend Developer and Machine Learning Engineer based in Mumbai. For the past few years I’ve lived in backend systems and ML — building solutions that aren’t just functional, but scalable, efficient, and intelligent.',
    'My approach is rooted in efficiency and scalability: great systems start with the “why”. I lean on systematic analysis, iterative development in Node.js, TypeScript and Python, and thorough testing to ship APIs that feel effortless, where performance and reliability work hand in hand.',
    'Off-screen, you’ll find me deep in a strategy game, running Mumbai’s scenic routes, experimenting as a home chef, or out on a hiking trail. The strategy, endurance and creativity all feed back into how I solve problems in code.',
  ],
  education: {
    degree: 'B.Tech, Computer Science & Engineering (AI & ML)',
    minor: 'Minor in Business Management',
    school: 'Amity University, Mumbai',
    detail: 'CGPA 7.93 / 10 · Google Data Analytics Professional Certificate',
  },
  achievements: [
    'Cut API latency by 99.7% — 45s down to 145ms',
    'Improved client incident resolution by 17%',
    'Processed 500,000+ customer records for insights',
    'Top 59 — Analytics Olympiad 2023',
    'Selected for ISRO’s START programme',
  ],
};

/* --- Skills -------------------------------------------------------------- */
export const skills: SkillGroup[] = [
  { label: 'Backend', items: ['Node.js', 'TypeScript', 'Python', 'REST APIs'] },
  { label: 'ML / AI', items: ['scikit-learn', 'Pandas', 'NumPy', 'LangChain', 'OpenAI API'] },
  { label: 'Cloud & DevOps', items: ['AWS', 'Azure', 'Docker', 'CI/CD', 'Git'] },
  { label: 'Data', items: ['MySQL', 'MongoDB', 'Snowflake', 'Power BI'] },
];

/* --- Testimonials -------------------------------------------------------- */
export const testimonials: Testimonial[] = [
  {
    quote:
      'Richie’s backend work completely transformed our API performance — he cut response latency by 99.7%, from 45 seconds to just 145ms. His Node.js and TypeScript expertise and systematic problem-solving made him invaluable.',
    name: 'Rohit Agre',
    title: 'CTO, Sunday Tech',
    avatar: '/testimonials/rohit.jpeg',
  },
  {
    quote:
      'Working with Richie was exceptional. His handling of production-critical issues within SLA drove a 17% improvement in our incident resolution, and his integration docs across 25+ services were thorough and professional.',
    name: 'Amit Sharma',
    title: 'Supervisor, WNS Global Services',
    avatar: '/testimonials/amit.jpeg',
  },
  {
    quote:
      'Richie stands out for his analytical approach to data science. His EDA on 500,000+ records and ETL on 10GB+ datasets showed remarkable rigor, and his ML models directly informed our marketing strategy.',
    name: 'Arushi Gogia',
    title: 'Mentor, Celebal Technologies',
    avatar: '/testimonials/arushi.jpeg',
  },
];
