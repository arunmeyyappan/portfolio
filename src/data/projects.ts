// ─────────────────────────────────────────────────────────────
// EDIT ME: add, edit or remove projects here. Every page reads this file.
// Only verified facts are included. Fields marked "editable" are placeholders.
// ─────────────────────────────────────────────────────────────

export type VisualKind = 'evocodes' | 'taskflow' | 'buddybook' | 'arad' | 'grantu' | 'mentor' | 'foods' | 'generic';

export interface Project {
  slug: string;
  title: string;
  category: string;
  role: string;
  summary: string;
  description: string;
  stack: string[];
  features: string[];
  links: { label: string; url: string }[];
  visual: VisualKind;
  accent: 'violet' | 'cyan' | 'ember';
  featured: boolean;
  status?: string; // e.g. "Prototype"
  editable?: boolean; // true when the text still needs your input
  image?: string; // optional cover image URL (set from the dashboard)
}

export const projects: Project[] = [
  {
    slug: 'evo-codes',
    title: 'EVO Codes',
    category: 'Startup / SaaS',
    role: 'Founder & CEO',
    summary: 'My flagship startup venture, building digital products with a product-oriented approach.',
    description:
      'EVO Codes is my startup SaaS venture, where I serve as Founder and CEO. It is built around a product-oriented approach to software: turning ideas into well-engineered digital products.',
    stack: ['Vercel (website hosting)', 'Render (backend API)'], // add verified technologies
    features: [], // add verified product features here
    links: [
      { label: 'Visit website', url: 'https://evocodes.in' },
    ],
    visual: 'evocodes',
    accent: 'violet',
    featured: true,
  },
  {
    slug: 'taskflow',
    title: 'TaskFlow',
    category: 'Full-Stack Development / DevOps',
    role: 'Full-stack developer',
    summary: 'A MERN task manager containerized with Docker and orchestrated with Docker Compose.',
    description:
      'A MERN task management application containerized using Docker, with the frontend and backend packaged as separate images and orchestrated together with Docker Compose.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'Docker', 'Docker Compose'],
    features: [
      'Task creation',
      'Task management',
      'Persistent MongoDB storage',
      'Separate frontend and backend containers',
      'Docker Compose orchestration',
    ],
    links: [
      { label: 'Docker Hub: frontend', url: 'https://hub.docker.com/r/arunmeyyappan/taskflow-frontend' },
      { label: 'Docker Hub: backend', url: 'https://hub.docker.com/r/arunmeyyappan/taskflow-backend' },
    ],
    visual: 'taskflow',
    accent: 'cyan',
    featured: true,
  },
  {
    slug: 'buddy-book',
    title: 'Buddy Book',
    category: 'Full-Stack Application',
    role: 'Full-stack developer',
    summary: 'A contact management app with authentication and a REST API.',
    description:
      'A contact management application with user authentication, built on a React frontend and a Node.js/Express REST API backed by MongoDB.',
    stack: ['React', 'Node.js', 'Express', 'MongoDB', 'JWT'],
    features: [
      'Authentication',
      'Contact creation',
      'Editing',
      'Deletion',
      'Searching',
      'REST API integration',
    ],
    links: [{ label: 'Live website', url: 'https://openbuddybook.vercel.app' }],
    visual: 'buddybook',
    accent: 'violet',
    featured: true,
  },
  {
    slug: 'arad-rescue-device',
    title: 'ARAD Rescue Device',
    category: 'IoT / Innovation / Emergency Response',
    role: 'Concept, design and development',
    summary: 'An IoT prototype that helps identify potentially stranded or inactive travelers at tourism locations.',
    description:
      'An IoT-based rescue monitoring solution designed to help identify potentially stranded or inactive travelers at tourism locations. The ESP32 receives GPS and movement sensor readings. LoRa communication transfers alerts to a receiving station, which communicates with a MERN-based rescue dashboard and MongoDB.',
    stack: ['ESP32', 'MPU6050', 'NEO-6M GPS', 'SX1278 LoRa', 'MongoDB', 'Express', 'React', 'Node.js'],
    features: [
      'Establish an initial GPS reference position',
      'Monitor movement within approximately a 3-metre radius',
      'Detect prolonged inactivity after approximately three minutes',
      'Activate buzzer and LED warning indications',
      'Send an inactivity alert with GPS coordinates and sensor information after the warning period',
    ],
    links: [],
    visual: 'arad',
    accent: 'ember',
    featured: true,
    status: 'Innovation prototype',
  },
  {
    slug: 'grantu-education',
    title: 'GrantU Education',
    category: 'Education Technology',
    role: 'Editable: add your role',
    summary: 'Education technology project. Details to be added.',
    description:
      'Editable: add a description of GrantU Education here. No functionality or technology details have been assumed.',
    stack: [], // add verified technologies
    features: [], // add verified features
    links: [],
    visual: 'grantu',
    accent: 'cyan',
    featured: true,
    editable: true,
  },
  {
    slug: 'mentor-campus',
    title: 'Mentor Campus',
    category: 'Website Development',
    role: 'Frontend development and design',
    summary: 'A website redesign with a premium black-themed visual identity.',
    description:
      'A website redesign project featuring a premium black-themed visual identity, highlighting my frontend development and design contribution.',
    stack: [], // add verified technologies
    features: [],
    links: [],
    visual: 'mentor',
    accent: 'violet',
    featured: true,
  },
  {
    slug: 'sri-subanka-foods',
    title: 'Sri Subanka Foods',
    category: 'Business Website Development',
    role: 'Website development',
    summary: 'A business website developed for Sri Subanka Foods.',
    description: 'Business website development work for Sri Subanka Foods.',
    stack: [],
    features: [],
    links: [{ label: 'Live website', url: 'https://srisubankafoods.com' }],
    visual: 'foods',
    accent: 'ember',
    featured: true,
  },
  // ── Secondary projects ───────────────────────────────────────
  {
    slug: 'tasty-table',
    title: 'Tasty Table',
    category: 'Web Project',
    role: 'Developer',
    summary: 'Editable: add a short description.',
    description: 'Editable: add a description of Tasty Table.',
    stack: [],
    features: [],
    links: [],
    visual: 'generic',
    accent: 'ember',
    featured: false,
    editable: true,
  },
  {
    slug: 'aksharas-academy',
    title: 'Aksharas Academy',
    category: 'Web Project',
    role: 'Developer',
    summary: 'Editable: add a short description.',
    description: 'Editable: add a description of Aksharas Academy.',
    stack: [],
    features: [],
    links: [],
    visual: 'generic',
    accent: 'cyan',
    featured: false,
    editable: true,
  },
  {
    slug: 'edusity',
    title: 'Edusity',
    category: 'Web Project',
    role: 'Developer',
    summary: 'Editable: add a short description.',
    description: 'Editable: add a description of Edusity.',
    stack: [],
    features: [],
    links: [],
    visual: 'generic',
    accent: 'violet',
    featured: false,
    editable: true,
  },
  {
    slug: 'weather-application',
    title: 'Weather Application',
    category: 'Web Project / API Integration',
    role: 'Developer',
    summary: 'A weather application using the OpenWeather API.',
    description: 'A weather application built with the OpenWeather API.',
    stack: ['OpenWeather API'],
    features: [],
    links: [],
    visual: 'generic',
    accent: 'cyan',
    featured: false,
  },
];

