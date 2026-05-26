import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const sproochliProductSentence = 'Multilingual QR pages for real-world places.'

type SproochliRouteKind = 'public' | 'console'

type SproochliRoute = {
  label: string
  path: string
  kind: SproochliRouteKind
}

export const sproochliRoutes: SproochliRoute[] = [
  { label: 'Home', path: '/', kind: 'public' },
  { label: 'BNB Guides', path: '/bnb', kind: 'public' },
  { label: 'Holiday with Nats Wi-Fi', path: '/bnb/holiday-with-nats/wifi', kind: 'public' },
  { label: 'Bike Rental Instructions', path: '/info/bern-bike-rental/rental-instructions', kind: 'public' },
  { label: 'Read-only Menus', path: '/menus', kind: 'public' },
]

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
      'A standalone FireUX app for simple public pages. BNB guides are for hosts, read-only menus are a stepping stone before Misebox, and info pages cover everything else.',
    about_p1:
      'Sproochli publishes simple QR-friendly public pages without needing a full console or ordering system.',
    about_p2:
      'The MVP starts with static pages for BNB guides, read-only menus, and general local information.',
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
      label: 'View BNB guide',
      to: '/bnb/holiday-with-nats',
    },
    secondary: {
      label: 'View info page',
      to: '/info/bern-bike-rental/rental-instructions',
    },
    console: {
      label: 'Sproochli',
      to: '/',
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
  solutions: [
    {
      slug: 'translate-public-doc',
      title: 'Translate a public doc',
      description: 'Turn one approved public information page into language-specific versions.',
      icon: 'i-lucide-languages',
    },
    {
      slug: 'translate-menu',
      title: 'Translate a menu',
      description: 'Provide multilingual menu information before a full structured Misebox menu is needed.',
      icon: 'i-lucide-utensils',
    },
    {
      slug: 'translate-guest-instructions',
      title: 'Translate guest instructions',
      description: 'Make guest, rental, or visitor instructions easier to read in multiple languages.',
      icon: 'i-lucide-house',
    },
    {
      slug: 'multilingual-qr-pages',
      title: 'Create multilingual QR pages',
      description: 'Publish QR-friendly pages where visitors can choose the language they need.',
      icon: 'i-lucide-qr-code',
    },
    {
      slug: 'language-support-for-docs',
      title: 'Add language support for docs',
      description: 'Use Sproochli as the translation layer for public docs, menus, guides, and notices.',
      icon: 'i-lucide-file-text',
    },
  ],
  entities: [
    {
      id: 'Place',
      purpose: 'The real-world place or business that owns one or more public info pages.',
    },
    {
      id: 'InfoPage',
      purpose: 'A published QR-readable page for BNB, menu, or general information.',
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

`,
  routes: {
    public: sproochliRoutes.filter((route) => route.kind === 'public').map((route) => route.path),
    console: sproochliRoutes.filter((route) => route.kind === 'console').map((route) => route.path),
  },
})
