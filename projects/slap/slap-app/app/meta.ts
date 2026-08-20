// Concurrent edit — 2026-07-21 13:08 CEST — Operations catalogue: declare the current empty workspace-operation set.
import { defineFireuxMeta } from 'fireux-core/config/app/meta-content'

export const appMeta = {
  name: 'Slap',
  brand: {
    appName: 'slap',
    bigPersonality: 'Slap',
    headline: '',
  },
  heroPrimaryHtml:
    'Slap is a <strong>culture-commerce app ecosystem</strong> for brands with edge. Launch the shop, tell the story, sell the drop.',
  workspaceBridgeHtml:
    'Built for drops, stories, galleries, and storefronts that need a pulse.',
  landingPrimaryCtaLabel: 'Get started',
  landingSecondaryCtaLabel: 'Browse drops',
  landingSecondaryCtaTo: '/products',
  heroBullets: [
    'Hosted sites for brands where the website is part of the vibe',
    'Drops, products, stories, and gallery-led public pages',
    'Firebase, SEO, deployment, and workspace workflows underneath',
    'Yellow Velo is the first tenant identity in the Slap ecosystem',
  ],
  heroPanelItems: [
    {
      title: 'Sites that sell',
      description: 'Brand homepages, drops, collections, and product pages.',
      icon: 'i-lucide-store',
    },
    {
      title: 'Stories with culture',
      description: 'Editorial posts for launches, routes, events, and scene notes.',
      icon: 'i-lucide-newspaper',
    },
    {
      title: 'Gallery energy',
      description: 'Lookbooks, photo essays, and visual proof that the brand is alive.',
      icon: 'i-lucide-images',
    },
  ],
  about: {
    label: 'About Slap',
    tagline: 'Commerce with culture',
    description:
      'Slap is not a Shopify clone. It is a culture-commerce wrapper for small brands that need more attitude than a generic site builder and more structure than a one-off site.',
    supportingCopy:
      'The first useful version is deliberately small: public brand pages, products and drops, stories, gallery-led pages, and optional tour or service surfaces.',
    ticks: [
      'Slap owns the language, visual direction, and lifestyle-commerce defaults',
      'The stack underneath stays quiet and out of the brand',
      'Yellow Velo now lives as the first Slap tenant identity',
    ],
  },
  getStarted: {
    hero: {
      eyebrow: 'Start lean',
      title: 'Build the brand surface first',
      description:
        'Slap begins with a clear ecosystem boundary and a global app shell. Deeper commerce, checkout, and booking workflows can arrive after the pilot proves the shape.',
      primaryAction: {
        label: 'Open products',
        to: '/products',
      },
      secondaryAction: {
        label: 'Read the boundary',
        to: '/about',
      },
    },
    steps: [
      {
        badge: 'Step 1',
        title: 'Define the brand',
        copy: 'Capture the audience, language, routes, imagery, and culture-commerce intent.',
      },
      {
        badge: 'Step 2',
        title: 'Publish drops and stories',
        copy: 'Shape products and posts as Slap drops, collections, and editorial story surfaces.',
      },
      {
        badge: 'Step 3',
        title: 'Grow Yellow Velo',
        copy: 'Use Yellow Velo as the first real Slap identity for drops, stories, and commerce polish.',
      },
    ],
  },
  seoHome: {
    title: 'Slap',
    description:
      'Slap is a lifestyle-commerce ecosystem for culture-led brands, drops, stories, galleries, and indie ecommerce.',
  },
  seoAbout: {
    title: 'About Slap',
    description:
      'The Slap ecosystem boundary: a cool, isolated lifestyle-commerce surface for brands with edge.',
  },
  seoGetStarted: {
    title: 'Get Started · Slap',
    description: 'Start a Slap lifestyle-commerce app.',
  },
} as const

export const metaContent = defineFireuxMeta({
  app: {
    id: 'slap',
    name: appMeta.name,
    ecosystem: 'slap',
  },
  copy: {
    big_personality: appMeta.brand.bigPersonality,
    headline: appMeta.brand.headline,
    highlight_terms: ['Slap', 'Commerce with culture', 'Drops', 'Stories'],
    positioning_html: appMeta.heroPrimaryHtml,
    promise_html: appMeta.about.supportingCopy,
    workspace_bridge_html: appMeta.workspaceBridgeHtml,
    about_p1: appMeta.about.description,
    about_p2: appMeta.about.supportingCopy,
  },
  seo: {
    ...appMeta.seoHome,
    keywords: [
      'lifestyle commerce',
      'culture commerce',
      'brand websites',
      'drops and stories',
      'indie ecommerce',
    ],
    audience: ['lifestyle brands', 'bike shops', 'streetwear labels', 'artists', 'local brands'],
    categories: ['commerce ecosystem', 'brand website platform', 'culture-commerce'],
    primary_topic: 'lifestyle-commerce ecosystem',
  },
  cta: {
    primary: {
      label: appMeta.landingPrimaryCtaLabel,
      to: '/get-started',
    },
    secondary: {
      label: appMeta.landingSecondaryCtaLabel,
      to: appMeta.landingSecondaryCtaTo,
    },
    workspace: {
      label: 'Open workspace',
      to: '/workspace',
    },
  },
  lists: {
    hero_bullets: [...appMeta.heroBullets],
    about_ticks: [...appMeta.about.ticks],
  },
  operations: [],
  solutions: [
    {
      slug: 'slap-sites',
      title: 'Slap Sites',
      description: 'Public websites with a strong brand surface for culture-led commerce.',
      icon: 'i-lucide-monitor-smartphone',
    },
    {
      slug: 'slap-drops',
      title: 'Slap Drops',
      description: 'Products, collections, stock states, and featured items with launch energy.',
      icon: 'i-lucide-package-open',
    },
    {
      slug: 'slap-stories',
      title: 'Slap Stories',
      description: 'Editorial story surfaces for launches, local culture, routes, and behind-the-build notes.',
      icon: 'i-lucide-newspaper',
    },
  ],
  entities: [
    {
      id: 'Brand',
      purpose: 'The public lifestyle-commerce identity for a Slap-powered project.',
    },
    {
      id: 'Drop',
      purpose: 'A product, collection, or launch item surfaced through Slap drops.',
    },
    {
      id: 'Story',
      purpose: 'A culture-led editorial post surfaced through Slap stories.',
    },
  ],
  routes: {
    public: ['/', '/about', '/get-started', '/products', '/blog'],
    workspace: ['/workspace'],
  },
})
