import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const sproochliProductSentence = 'Multilingual QR pages for real-world places.'

export const sproochliRoutes = [
  { label: 'Home', path: '/', kind: 'public' },
  { label: 'Bike Rental Instructions', path: '/info/bern-bike-rental/rental-instructions', kind: 'public' },
  { label: 'Info Pages Console', path: '/console/info', kind: 'console' },
] as const

export const metaContent = defineFireuxMeta({
  app: {
    id: 'sproochli',
    name: 'Sproochli',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'Small Pages',
    headline: 'Many Languages',
    highlight_terms: [
      'multilingual QR pages',
      'real-world places',
      'certified languages',
      'cached languages',
    ],
    positioning_html:
      'Sproochli creates <strong>multilingual QR pages</strong> for real-world places that need clear visitor information without a heavy app.',
    promise_html:
      'Owners write the original page, approve certified translations, and can later use cached generated translations for specific pages.',
    console_bridge_html:
      'A standalone FireUX app for generic place information pages. It is intentionally separate from Misebox and does not depend on kitchens, menus, chefs, or suppliers.',
    about_p1:
      'Sproochli lets businesses and places publish simple QR-friendly information pages in multiple languages.',
    about_p2:
      'The MVP starts with static sample data and a crawler-readable JSON endpoint before adding a full editor or Firestore persistence.',
  },
  seo: {
    title: 'Sproochli - Multilingual QR pages for real-world places',
    description:
      'Create simple public QR information pages in multiple languages for bike rentals, guest info, house rules, safety notes, and visitor guides.',
    keywords: [
      'multilingual QR pages',
      'visitor information pages',
      'guest information',
      'bike rental instructions',
      'public notices',
    ],
    audience: ['place owners', 'small businesses', 'visitor operations teams'],
    categories: ['qr pages', 'translation', 'place information'],
    primary_topic: 'multilingual QR information pages',
  },
  cta: {
    primary: {
      label: 'View sample page',
      to: '/info/bern-bike-rental/rental-instructions',
    },
    secondary: {
      label: 'Open console',
      to: '/console/info',
    },
    console: {
      label: 'Info pages',
      to: '/console/info',
    },
  },
  lists: {
    hero_bullets: [
      'Bike rental instructions',
      'Airbnb guest information',
      'House rules and safety notes',
    ],
    about_ticks: [
      'Original owner-written content',
      'Certified owner-approved translations',
      'Cached generated translations for specific pages',
    ],
  },
  entities: [
    {
      id: 'Place',
      purpose: 'The real-world place or business that owns one or more public info pages.',
    },
    {
      id: 'InfoPage',
      purpose: 'A published QR-readable information page for a place.',
    },
    {
      id: 'InfoSection',
      purpose: 'A sorted page section with translated title and description fields.',
    },
    {
      id: 'InfoBlock',
      purpose: 'A sorted content block such as text, warning, list, contact, or link.',
    },
  ],
  relations_ascii: `
Place
  -> InfoPage
    -> InfoSection
      -> InfoBlock

InfoPage
  -> translation_cache/{language}
`,
  routes: {
    public: sproochliRoutes.filter((route) => route.kind === 'public').map((route) => route.path),
    console: sproochliRoutes.filter((route) => route.kind === 'console').map((route) => route.path),
  },
})
