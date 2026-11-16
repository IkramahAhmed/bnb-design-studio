/** All copy and business facts live here, so pages and metadata never disagree. */

export const SITE = {
  name: 'BnB Design Studio',
  url: 'https://bnbdesignstudio.net',
  tagline: 'Your Dream, My Design.',
  description:
    'BnB Design Studio provides architectural design, structural design, MEP engineering and city permit drawing sets across the Dallas-Fort Worth Metroplex.',
  foundedYear: 2019,
  phone: '+1 (940) 733-4995',
  phoneHref: 'tel:+19407334995',
  email: 'info@bnbdesignstudio.net',
  address: { locality: 'Wylie', region: 'TX', postalCode: '75098', country: 'US' },
  ownerName: 'Babar',
} as const;

export const NAV_LINKS = [
  { href: '#about', label: 'About', path: '/about/' },
  { href: '#services', label: 'Services', path: '/services/' },
  { href: '#approach', label: 'Approach', path: '/approach/' },
  { href: '#portfolio', label: 'Portfolio', path: '/portfolio/' },
  { href: '#contact', label: 'Contact', path: '/contact/' },
] as const;

/** Maps each section id → its canonical clean URL path (no hash). */
export const SECTION_PATHS: Readonly<Record<string, string>> = {
  home: '/',
  about: '/about/',
  services: '/services/',
  structural: '/services/',
  mep: '/services/',
  permits: '/services/',
  approach: '/approach/',
  portfolio: '/portfolio/',
  contact: '/contact/',
};

export interface ServiceTag {
  label: string;
  /** Colour key for the MEP legend dots. */
  dot?: 'hvac' | 'power' | 'water';
}

export interface Service {
  id: string;
  number: string;
  eyebrow: string;
  title: string;
  summary: string;
  align: 'left' | 'right';
  tags: ServiceTag[];
}

export const SERVICES: readonly Service[] = [
  {
    id: 'services',
    number: '01',
    eyebrow: 'Layer · Architecture',
    title: 'Architectural Design',
    summary: 'We draw the building: how it looks, how it flows and how it fits your land.',
    align: 'left',
    tags: [
      { label: 'New Construction & Building Design' },
      { label: 'Commercial Building Design' },
      { label: 'Retail Stores & Shopping Centers' },
      { label: 'Restaurants, Cafés & Coffee Shops' },
      { label: 'Office Buildings & Tenant Improvements' },
      { label: 'Interior Remodeling & Space Planning' },
      { label: 'Renovations & Additions' },
      { label: 'As-Built Drawings & Existing Conditions' },
      { label: 'Site Plans, Floor Plans, Elevations & Sections' },
    ],
  },
  {
    id: 'structural',
    number: '02',
    eyebrow: 'Layer · Structure',
    title: 'Structural Design',
    summary: 'We make sure it stands strong: foundations, frames and the calculations behind them.',
    align: 'right',
    tags: [
      { label: 'Foundation Plans & Details' },
      { label: 'Structural Framing Plans' },
      { label: 'Steel, Wood & Concrete Systems' },
      { label: 'Structural Modifications & Additions' },
      { label: 'Structural Calculations & Details' },
    ],
  },
  {
    id: 'mep',
    number: '03',
    eyebrow: 'Layer · MEP',
    title: 'Air, Power & Water',
    summary: 'Mechanical, Electrical and Plumbing (MEP): we plan it so the space is comfortable to live and work in.',
    align: 'left',
    tags: [
      { label: 'HVAC Layouts & Mechanical Plans', dot: 'hvac' },
      { label: 'Electrical Power & Lighting Plans', dot: 'power' },
      { label: 'Electrical Panel Schedules', dot: 'power' },
      { label: 'Plumbing Plans & Fixture Layouts', dot: 'water' },
      { label: 'Water Supply & Sanitary Waste Plans', dot: 'water' },
      { label: 'Equipment Schedules & Specifications' },
      { label: 'MEP Engineering Coordination' },
    ],
  },
  {
    id: 'permits',
    number: '04',
    eyebrow: 'Layer · Documentation',
    title: 'Permit-Ready Drawings',
    summary: 'We prepare what the city needs and handle review comments, so you can start building sooner.',
    align: 'right',
    tags: [
      { label: 'Complete Architectural Permit Sets' },
      { label: 'Structural Permit Drawing Sets' },
      { label: 'MEP Permit Sets' },
      { label: 'Coordinated Construction Documents' },
      { label: 'Building Code & Life Safety Plans' },
      { label: 'City Permit Submission Documentation' },
      { label: 'Plan Review Comments & Revisions' },
      { label: 'Coordination with City Building Departments' },
    ],
  },
];

export interface SectionInfo {
  id: string;
  name: string;
}

/** Page sections that are not services. `id` is the anchor, `name` is shown in the scene indicator. */
export const SECTION = {
  home: { id: 'home', name: 'Welcome' },
  about: { id: 'about', name: 'About' },
  approach: { id: 'approach', name: 'Approach' },
  portfolio: { id: 'portfolio', name: 'Portfolio' },
  contact: { id: 'contact', name: 'Contact' },
} as const satisfies Record<string, SectionInfo>;

/** Every section in page order. Must match `SCENES` in lib/three/scenes.ts one-to-one. */
export const SECTION_ORDER: readonly SectionInfo[] = [
  SECTION.home,
  SECTION.about,
  ...SERVICES.map((service) => ({ id: service.id, name: service.title })),
  SECTION.approach,
  SECTION.portfolio,
  SECTION.contact,
];

export const ABOUT_STATS = [
  { value: String(SITE.foundedYear), label: 'Established' },
  { value: '3-in-1', label: 'Arch · Struct · MEP' },
  { value: 'DFW', label: 'Metroplex' },
] as const;

export const APPROACH_STEPS = [
  'Concept & existing building survey',
  'Detailed construction documents',
  'Permit submission & revisions',
] as const;

export const PROJECTS = [
  { title: 'Restaurant Finish-Out', note: 'Photos coming soon' },
  { title: 'Retail Development', note: 'Photos coming soon' },
  { title: 'Commercial Renovation', note: 'Photos coming soon' },
] as const;

export const PROJECT_TYPES = [
  'Commercial building',
  'Restaurant / Café',
  'Retail',
  'Office / Tenant improvement',
  'Residential',
  'Permit drawings only',
] as const;
