import {
  HiOutlineBell,
  HiOutlineShieldCheck,
  HiOutlinePhotograph,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineDocumentText,
  HiOutlineHome,
  HiOutlineKey,
  HiOutlineBriefcase,
  HiOutlineCog,
} from 'react-icons/hi';

/* ──────────────────────────────── NAV ──────────────────────────────── */

export const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Login', href: '/login' },
];

/* ─────────────────────────────── HERO ─────────────────────────────── */

export const HERO = {
  headline: 'Stop Managing Maintenance\nin WhatsApp Groups',
  subheadline:
    'Fixra replaces the chaos of scattered messages, missed calls, and zero accountability with structured tickets, real-time tracking, and a full audit trail — from report to resolution.',
  primaryCta: { label: 'Get Started', href: '/register' },
  secondaryCta: { label: 'See How It Works', href: '#how-it-works' },
};

/* ──────────────────────────── PROBLEM ─────────────────────────────── */

export const PROBLEM = {
  title: 'The Problem Is Clear',
  subtitle: 'Property maintenance shouldn\'t rely on chat threads and hope.',
  oldWay: {
    label: 'The Old Way',
    items: [
      'Tenants message in WhatsApp — gets buried',
      'Calls to landlords go unanswered',
      'No record of what was agreed',
      'Contractors have no paper trail',
      'Costs spiral without approval',
      'Nobody knows the current status',
    ],
  },
  newWay: {
    label: 'The Fixra Way',
    items: [
      'Structured tickets with clear status',
      'Every action logged with timestamps',
      'Media attachments for proof of work',
      'Cost approval before any spend',
      'Real-time notifications to all parties',
      'Full audit trail from report to resolution',
    ],
  },
};

/* ─────────────────────── HOW IT WORKS ─────────────────────────────── */

export const HOW_IT_WORKS = {
  title: 'From Report to Resolution',
  subtitle: 'A clear, accountable process in four steps.',
  steps: [
    {
      number: '01',
      title: 'Tenant Reports',
      description:
        'The tenant logs a maintenance issue with details and photos. No more lost messages.',
      color: 'primary',
    },
    {
      number: '02',
      title: 'Landlord Reviews',
      description:
        'The landlord reviews the ticket, approves scope and budget, then assigns a contractor.',
      color: 'sage',
    },
    {
      number: '03',
      title: 'Contractor Dispatches',
      description:
        'The contractor assigns a technician and schedules the job. Everyone stays in the loop.',
      color: 'amber',
    },
    {
      number: '04',
      title: 'Issue Resolved',
      description:
        'Work is completed, photos uploaded, costs recorded. The full history lives forever.',
      color: 'primary',
    },
  ],
};

/* ──────────────────────────── ROLES ───────────────────────────────── */

export const ROLES = {
  title: 'Built for Every Role',
  subtitle: 'Everyone in the maintenance chain gets exactly what they need.',
  cards: [
    {
      role: 'Landlord',
      icon: HiOutlineHome,
      description:
        'Full visibility over every property. Approve costs, track resolution times, and hold contractors accountable with a complete audit trail.',
      highlights: ['Approve budgets', 'Track all tickets', 'Performance reports'],
    },
    {
      role: 'Tenant',
      icon: HiOutlineKey,
      description:
        'Report issues in seconds with photos and descriptions. Track progress in real time without chasing anyone for updates.',
      highlights: ['Easy reporting', 'Real-time status', 'Photo attachments'],
    },
    {
      role: 'Contractor',
      icon: HiOutlineBriefcase,
      description:
        'Receive jobs with full context. Assign technicians, manage schedules, and submit cost breakdowns — all documented.',
      highlights: ['Job management', 'Technician dispatch', 'Cost tracking'],
    },
    {
      role: 'Technician',
      icon: HiOutlineCog,
      description:
        'Get dispatched with clear instructions. Log work done, upload proof photos, and close out jobs from your phone.',
      highlights: ['Clear job details', 'Upload proof', 'Mobile-friendly'],
    },
  ],
};

/* ─────────────────────────── FEATURES ─────────────────────────────── */

export const FEATURES = {
  title: 'Everything You Need',
  subtitle: 'Powerful features designed for property maintenance workflows.',
  items: [
    {
      icon: HiOutlineBell,
      title: 'Real-Time Notifications',
      description:
        'Instant push alerts when tickets are created, updated, or resolved. Nobody misses a beat.',
    },
    {
      icon: HiOutlineShieldCheck,
      title: 'Full Audit Trail',
      description:
        'Every action timestamped and logged. Know exactly who did what, and when.',
    },
    {
      icon: HiOutlinePhotograph,
      title: 'Media Attachments',
      description:
        'Tenants attach photos when reporting. Technicians upload proof of completed work.',
    },
    {
      icon: HiOutlineCurrencyDollar,
      title: 'Cost Approval Workflow',
      description:
        'Landlords approve costs before a single rand is spent. No surprise invoices.',
    },
    {
      icon: HiOutlineClock,
      title: 'Resolution Tracking',
      description:
        'Monitor how long tickets take to resolve. Identify bottlenecks and improve response times.',
    },
    {
      icon: HiOutlineDocumentText,
      title: 'Structured Tickets',
      description:
        'Standardised fields ensure nothing is missed. Priority levels, categories, and clear status updates.',
    },
  ],
};

/* ───────────────────────── FINAL CTA ─────────────────────────────── */

export const CTA = {
  title: 'Ready to Fix How You\nHandle Maintenance?',
  subtitle:
    'Join landlords and contractors who have already moved beyond WhatsApp chaos.',
  buttonLabel: 'Get Started — It\'s Free',
  buttonHref: '/register',
};

/* ──────────────────────────── FOOTER ──────────────────────────────── */

export const FOOTER = {
  tagline: 'Structured maintenance management for landlords, tenants, contractors, and technicians.',
  links: [
    {
      heading: 'Product',
      items: [
        { label: 'Features', href: '#features' },
        { label: 'How It Works', href: '#how-it-works' },
        { label: 'Pricing', href: '#' },
      ],
    },
    {
      heading: 'Company',
      items: [
        { label: 'About', href: '#' },
        { label: 'Contact', href: '#' },
        { label: 'Blog', href: '#' },
      ],
    },
    {
      heading: 'Legal',
      items: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
      ],
    },
  ],
  copyright: `© ${new Date().getFullYear()} Fixra. All rights reserved.`,
};
