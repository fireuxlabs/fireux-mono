import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const buenoHostProductSentence = 'Guest guides for holiday homes, BNBs, and serviced apartments.'

export const buenoHostRoutes = [
  { label: 'Home', path: '/', kind: 'public' },
  { label: 'BNB Guides', path: '/bnb', kind: 'public' },
  { label: 'Alpine View Demo', path: '/bnb/alpine-view-demo', kind: 'public' },
  { label: 'Alpine View Demo Wi-Fi', path: '/bnb/alpine-view-demo/wifi', kind: 'public' },
  { label: 'Host Dashboard', path: '/console/portfolio', kind: 'console' },
] as const

export const metaContent = defineFireuxMeta({
  app: {
    id: 'buenohost',
    name: 'BuenoHost',
    ecosystem: 'fireux',
  },
  copy: {
    big_personality: 'Better Stays',
    headline: 'Less Host Admin',
    highlight_terms: [
      'guest guides',
      'holiday homes',
      'check-in information',
      'local instructions',
    ],
    positioning_html:
      'BuenoHost turns host information into <strong>mobile guest guides</strong> for holiday homes, BNBs, and serviced apartments.',
    promise_html:
      'Hosts keep house rules, Wi-Fi, emergency contacts, checkout notes, parking, and local recommendations in one clean guest-facing guide.',
    console_bridge_html:
      'A standalone FireUX app for structured guest manuals on top of the shared fireux-properties engine. Sproochli can translate these guides later, but BuenoHost owns the host information.',
    about_p1:
      'BuenoHost is for hosts who want fewer repeated questions and clearer guest arrivals.',
    about_p2:
      'The MVP starts with static guide pages, then grows into an editable host console for reusable guest manual sections.',
  },
  seo: {
    title: 'BuenoHost - Guest guides for holiday homes and BNB hosts',
    description:
      'Create mobile guest guides for holiday homes, BNBs and serviced apartments with Wi-Fi, house rules, checkout, emergency contacts and local information.',
    keywords: [
      'BNB guest guide',
      'Airbnb house manual',
      'holiday apartment guide',
      'guest information app',
      'host information system',
    ],
    audience: ['holiday apartment hosts', 'BNB hosts', 'property managers'],
    categories: ['guest guides', 'host tools', 'holiday rentals'],
    primary_topic: 'mobile guest guides for short-stay accommodation',
  },
  cta: {
    primary: {
      label: 'View sample guide',
      to: '/bnb/alpine-view-demo',
    },
    secondary: {
      label: 'Browse BNB guides',
      to: '/bnb',
    },
    console: {
      label: 'Open host dashboard',
      to: '/console/portfolio',
    },
  },
  lists: {
    hero_bullets: [
      'Wi-Fi, keys, checkout and emergency info',
      'Host messages and stay-specific notes',
      'Reusable sections that hosts can enable or hide',
    ],
    about_ticks: [
      'Information-first guest experience',
      'Built for short-stay hosts and property managers',
      'Translation-ready through Sproochli later',
    ],
  },
  entities: [
    {
      id: 'Property',
      purpose: 'The holiday home, apartment, or serviced unit guests are staying in.',
    },
    {
      id: 'GuestGuide',
      purpose: 'The public mobile guide guests open before or during a stay.',
    },
    {
      id: 'GuideSection',
      purpose: 'A reusable guest information topic such as Wi-Fi, keys, checkout, or parking.',
    },
    {
      id: 'GuestMessage',
      purpose: 'A stay-specific welcome message that can later connect to calendar or booking data.',
    },
  ],
  relations_ascii: `
Property
  -> GuestGuide
    -> GuideSection
    -> GuestMessage

`,
  routes: {
    public: buenoHostRoutes.filter((route) => route.kind === 'public').map((route) => route.path),
    console: buenoHostRoutes.filter((route) => route.kind === 'console').map((route) => route.path),
  },
})
