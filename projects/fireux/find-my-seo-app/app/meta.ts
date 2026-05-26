import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const findMySeoProductSentence =
  'Find, compare, and contact SEO professionals for specific SEO problems.'

export const appMeta = {
  name: 'Find My SEO',
  landingPrimaryCtaLabel: 'Find an SEO specialist',
  landingSecondaryCtaLabel: 'Create a provider profile',
  landingSecondaryCtaTo: '/dashboard/professional/profile',
  seoHome: {
    title: 'Find My SEO - SEO professional pool',
    description:
      'Connect projects with SEO professionals using search-led profiles, service fit, sector experience, and proof.',
  },
  seoBrowse: {
    title: 'Browse SEO professionals - Find My SEO',
    description:
      'Compare curated SEO consultants and agencies by specialism, sector fit, proof, reviews, and availability.',
  },
  routes: [
    { label: 'Home', path: '/', kind: 'public' },
    { label: 'SEO Professionals', path: '/professionals', kind: 'public' },
    { label: 'Technical SEO', path: '/categories/technical-seo', kind: 'public' },
    { label: 'SEO for SaaS', path: '/seo-for-saas', kind: 'public' },
    { label: 'SEO for eCommerce', path: '/seo-for-ecommerce', kind: 'public' },
    { label: 'Case Studies', path: '/case-studies', kind: 'public' },
    { label: 'Dashboard', path: '/dashboard', kind: 'dashboard' },
    { label: 'Professional Profile', path: '/dashboard/professional/profile', kind: 'dashboard' },
  ],
} as const

const publicRoutes = appMeta.routes
  .filter((route) => route.kind === 'public')
  .map((route) => route.path)

const dashboardRoutes = appMeta.routes
  .filter((route) => route.kind === 'dashboard')
  .map((route) => route.path)

export const metaContent = defineFireuxMeta({
  app: {
    id: 'find-my-seo-app',
    name: appMeta.name,
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'SEO Professional Pool',
    headline: 'Connect your project with SEO professionals.',
    highlight_terms: [
      'SEO specialists',
      'sector fit',
      'service match',
      'case studies',
      'provider profiles',
    ],
    positioning_html:
      '<strong>Find, compare, and contact SEO professionals</strong> for specific SEO problems.',
    promise_html:
      'Search-led profiles help buyers compare SEO specialists by service, sector, availability, reviews, and proof.',
  },
  seo: {
    title: appMeta.seoHome.title,
    description: appMeta.seoHome.description,
    keywords: [
      'seo professional pool',
      'seo consultant directory',
      'find seo specialist',
      'seo agency search',
      'seo case studies',
    ],
    audience: ['business owners', 'marketing teams', 'seo buyers'],
    categories: ['seo marketplace', 'professional directory'],
    primary_topic: 'seo professional discovery',
  },
  cta: {
    primary: {
      label: appMeta.landingPrimaryCtaLabel,
      to: '/professionals',
    },
    secondary: {
      label: appMeta.landingSecondaryCtaLabel,
      to: appMeta.landingSecondaryCtaTo,
    },
  },
  lists: {
    hero_bullets: [
      'Search by specialism and sector',
      'Compare profile proof',
      'Manage profile basics from dashboard',
    ],
  },
  solutions: [
    {
      slug: 'professional-profile',
      title: 'Create a professional profile',
      description: 'Publish a focused SEO provider profile buyers can compare and understand.',
      icon: 'i-lucide-id-card',
    },
    {
      slug: 'local-search-discovery',
      title: 'Improve local search discovery',
      description: 'Use structured public profile information to help buyers find relevant SEO support.',
      icon: 'i-lucide-search',
    },
    {
      slug: 'service-landing-page',
      title: 'Build a service landing page',
      description: 'Explain a specific SEO service with proof, fit, and a clear route to contact.',
      icon: 'i-lucide-file-search',
    },
    {
      slug: 'lead-ready-business-info',
      title: 'Make business info lead-ready',
      description: 'Turn provider details into a page that can support enquiries and comparison.',
      icon: 'i-lucide-inbox',
    },
    {
      slug: 'ai-search-visibility',
      title: 'Prepare for AI search visibility',
      description: 'Shape public provider information so search and AI systems can understand it cleanly.',
      icon: 'i-lucide-sparkles',
    },
  ],
  entities: [
    {
      id: 'Professional',
      purpose: 'Public SEO provider identity used for discovery and comparison.',
      to: '/professionals',
    },
    {
      id: 'SeoCaseStudy',
      purpose: 'Structured proof attached to a professional or agency profile.',
      to: '/case-studies',
    },
    {
      id: 'Lead',
      purpose: 'Lightweight enquiry placeholder for project-to-provider contact.',
      to: '/dashboard/professional/profile',
    },
  ],
  routes: {
    public: publicRoutes,
    dashboard: dashboardRoutes,
    console: [],
  },
})
