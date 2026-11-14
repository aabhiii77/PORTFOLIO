export type SectionId = 'home' | 'projects' | 'technical-profile' | 'contact';

export interface NavItem {
  id: SectionId;
  label: string;
  href: `#${SectionId}`;
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'HOME', href: '#home' },
  { id: 'projects', label: 'PROJECTS', href: '#projects' },
  { id: 'technical-profile', label: 'TECHNICAL PROFILE', href: '#technical-profile' },
  { id: 'contact', label: 'CONTACT', href: '#contact' },
];

export const HERO_PROFILE = {
  displayNameLine1: 'AAYUSHI',
  displayNameLine2: 'KUMAR',
  headline: 'B.Tech AI & ML Student',
  introduction:
    "I'm Aayushi Kumar, a second-year B.Tech student specialising in Artificial Intelligence and Machine Learning. I enjoy exploring technology through practical projects and building useful digital solutions.",
  portraitUrl: '/assets/aistudio/aayushi_portrait_upright.jpeg',
  portraitAlt: 'Portrait of Aayushi Kumar',
  academicBar: {
    status: 'Second-Year Undergraduate',
    specialisation: 'Artificial Intelligence & Machine Learning',
  },
  ctas: {
    primary: {
      label: 'Explore Projects',
      href: '#projects' as const,
    },
    secondary: {
      label: 'Contact Me',
      href: '#contact' as const,
    },
  },
};

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl?: string;
  imageAlt?: string;
  fallbackTheme: 'espresso' | 'orange';
  liveUrl: string;
  actionLabel: string;
}

export const PROJECTS_SECTION_META = {
  heading: 'Projects',
};

export const PROJECTS: ProjectItem[] = [
  {
    id: 'ayucarez',
    title: 'Ayucarez',
    category: 'Healthcare Technology / AI',
    description: 'An AI-powered platform focused on AYUSH case-taking.',
    fallbackTheme: 'espresso',
    liveUrl: 'https://aayuflow.vercel.app/',
    actionLabel: 'VIEW PROJECT',
  },
  {
    id: 'blockwise-ai',
    title: 'Blockwise.AI',
    category: 'Railway Operations',
    description: 'A railway operations project centred on the NDLS → JP route.',
    fallbackTheme: 'orange',
    liveUrl: 'https://blockwise-ai-nine.vercel.app/login',
    actionLabel: 'VIEW PROJECT',
  },
];

export interface EducationEntryItem {
  status: string;
  qualification: string;
  specialisation: string;
}

export interface SkillEntryItem {
  id: string;
  label: string;
  accent: 'orange' | 'vermilion' | 'cobalt';
}

export interface SkillGroupItem {
  id: string;
  category: string;
  items: SkillEntryItem[];
}

export const TECHNICAL_PROFILE_META = {
  heading: 'Technical Profile',
  educationHeading: 'Education',
  toolkitHeading: 'Technical Toolkit',
};

export const EDUCATION_ENTRY: EducationEntryItem = {
  status: 'Second Year',
  qualification: 'Bachelor of Technology',
  specialisation: 'Artificial Intelligence & Machine Learning',
};

export const SKILL_GROUPS: SkillGroupItem[] = [
  {
    id: 'programming',
    category: 'PROGRAMMING',
    items: [
      { id: 'skill-python', label: 'Python', accent: 'orange' },
      { id: 'skill-java', label: 'Java', accent: 'vermilion' },
      { id: 'skill-c', label: 'C Programming', accent: 'cobalt' },
    ],
  },
  {
    id: 'data-analytics',
    category: 'DATA & ANALYTICS',
    items: [
      { id: 'skill-sql', label: 'SQL', accent: 'orange' },
      { id: 'skill-power-bi', label: 'Power BI', accent: 'vermilion' },
    ],
  },
];

export interface ContactChannelItem {
  id: string;
  label: string;
  handle: string;
  url: string;
}

export const CONTACT_SECTION_META = {
  heading: "Let's Connect.",
  introduction:
    'Open to connecting around AI, machine learning, and software projects. Reach out directly via email or LinkedIn.',
  primaryActionLabel: 'Send an Email',
  emailHref: 'mailto:aayushikoomar@gmail.com',
};

export const CONTACT_CHANNELS: ContactChannelItem[] = [
  {
    id: 'contact-email',
    label: 'Email',
    handle: 'aayushikoomar@gmail.com',
    url: 'mailto:aayushikoomar@gmail.com',
  },
  {
    id: 'contact-linkedin',
    label: 'LinkedIn',
    handle: 'linkedin.com/in/aayushi-kumar-a31a57383',
    url: 'https://www.linkedin.com/in/aayushi-kumar-a31a57383/',
  },
];

export const FOOTER_META = {
  closingStatement: 'Aayushi Kumar — B.Tech AI & ML Student',
  copyright: 'Aayushi Kumar',
  backToTopLabel: 'Back to Top',
};
