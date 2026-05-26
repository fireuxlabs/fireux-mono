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
      slug: 'multilingual-qr-page-generator',
      title: 'Multilingual QR page generator',
      description: 'Create one public QR page where visitors can choose the language they need.',
      icon: 'i-lucide-qr-code',
      status: 'live',
      keywords: ['multilingual QR page generator', 'QR code translation page'],
      cta: {
        label: 'View info page',
        to: '/info/bern-bike-rental/rental-instructions',
      },
    },
    {
      slug: 'guest-instructions-translator',
      title: 'Guest instructions translator',
      description: 'Translate check-in, Wi-Fi, rules, access, and stay instructions for guests.',
      icon: 'i-lucide-house',
      status: 'bridge',
      keywords: ['guest instructions translation', 'Airbnb guest information translation'],
      cta: {
        label: 'View BNB guide',
        to: '/bnb/holiday-with-nats',
      },
      relatedApp: {
        name: 'BuenoHost',
        to: 'https://buenohost.web.app',
        description: 'BuenoHost owns the deeper property-aware guest guide workflow.',
        external: true,
      },
    },
    {
      slug: 'house-rules-translator',
      title: 'House rules translator',
      description: 'Translate house rules and venue rules so guests understand expectations clearly.',
      icon: 'i-lucide-clipboard-check',
      status: 'very-easy',
      keywords: ['house rules translation', 'Airbnb house rules translation'],
      cta: {
        label: 'View BNB guide',
        to: '/bnb/holiday-with-nats',
      },
    },
    {
      slug: 'rental-instructions-translator',
      title: 'Rental instructions translator',
      description: 'Translate rental instructions for bikes, rooms, equipment, vehicles, or shared facilities.',
      icon: 'i-lucide-bike',
      status: 'live',
      keywords: ['rental instructions translation', 'bike rental instructions translation'],
      cta: {
        label: 'View rental example',
        to: '/info/bern-bike-rental/rental-instructions',
      },
    },
    {
      slug: 'menu-translator',
      title: 'Menu translator',
      description: 'Publish read-only translated menu pages before a full structured Misebox menu is needed.',
      icon: 'i-lucide-utensils',
      status: 'bridge',
      keywords: ['menu translation', 'QR code menu translation'],
      cta: {
        label: 'View menu area',
        to: '/menus',
      },
      relatedApp: {
        name: 'Misebox',
        to: 'https://misebox.app',
        description: 'Misebox owns structured dishes, sections, prices, allergens, and ordering.',
        external: true,
      },
    },
    {
      slug: 'safety-notice-translator',
      title: 'Safety notice translator',
      description: 'Translate warnings, emergency steps, equipment notes, and safety instructions.',
      icon: 'i-lucide-triangle-alert',
      status: 'planned',
      keywords: ['safety notice translation', 'emergency instructions translation'],
    },
    {
      slug: 'sign-and-notice-translator',
      title: 'Sign and notice translator',
      description: 'Turn signs, posters, counter cards, and printed notices into multilingual QR pages.',
      icon: 'i-lucide-signpost',
      status: 'very-easy',
      keywords: ['sign translation QR code', 'notice translation QR page'],
    },
    {
      slug: 'visitor-guide-translator',
      title: 'Visitor guide translator',
      description: 'Translate local guides, recommendations, directions, parking, and visitor help.',
      icon: 'i-lucide-map',
      status: 'bridge',
      keywords: ['visitor guide translation', 'local guide translation'],
      relatedApp: {
        name: 'BuenoHost',
        to: 'https://buenohost.web.app',
        description: 'BuenoHost owns richer property and local guide management for stays.',
        external: true,
      },
    },
    {
      slug: 'public-information-page-translator',
      title: 'Public information page translator',
      description: 'Translate public-facing information pages for places, venues, services, and local operations.',
      icon: 'i-lucide-file-text',
      status: 'live',
      keywords: ['public information translation', 'visitor information translation'],
      cta: {
        label: 'View info page',
        to: '/info/bern-bike-rental/rental-instructions',
      },
    },
    {
      slug: 'certified-page-translation',
      title: 'Certified page translation',
      description: 'Publish owner-approved or human-approved translations for public visitor pages.',
      icon: 'i-lucide-badge-check',
      status: 'planned',
      keywords: ['certified page translation', 'approved translation pages'],
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
