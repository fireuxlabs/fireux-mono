import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const buenoHostProductSentence =
  'Digital stay guides for hosts, properties, and guests.'

export const buenoHostLanguage = {
  copy: {
    big_personality: 'Better Stays',
    headline: 'Digital Stay Companion',
    highlight_terms: [
      'digital stay companion',
      'guest information',
      'local recommendations',
      'check-in details',
    ],
    positioning_html:
      'BuenoHost turns property and guest information into <strong>digital stay guides</strong> for hosts and guests.',
    promise_html:
      'Hosts keep Wi-Fi, check-in details, parking, house rules, checkout notes, emergency contacts, and local recommendations in one clean guest-facing experience.',
    console_bridge_html:
      'A standalone FireUX app for structured guest information on top of the shared fireux-properties engine. BuenoHost owns the property-facing stay companion experience, with optional services able to connect later.',
    about_p1:
      'BuenoHost is for hosts and property managers who want clearer guest arrivals, fewer repeated questions, and a more professional stay experience.',
    about_p2:
      'The MVP starts with public stay companions, then grows into editable host tools for reusable manual sections, local recommendations, and stay-specific notes.',
  },
  seo: {
    title: 'BuenoHost - Digital stay companions for guests',
    description:
      'Create a digital stay companion for rooms, apartments, holidays and serviced stays with Wi-Fi, check-in details, parking, house rules, checkout notes and local information.',
    keywords: [
      'digital stay companion',
      'guest information app',
      'Airbnb house manual',
      'holiday apartment guest information',
      'local recommendations for guests',
      'host information system',
    ],
    audience: ['holiday apartment hosts', 'short-stay hosts', 'property managers'],
    categories: ['guest experience', 'host tools', 'digital stay companion'],
    primary_topic: 'digital stay companions for guest accommodation',
  },
  cta: {
    primary: {
      label: 'Open host console',
      to: '/console/property',
    },
    secondary: {
      label: 'View property info',
      to: '/properties/demo-stay/info',
    },
    console: {
      label: 'Open host console',
      to: '/console/property',
    },
  },
  lists: {
    hero_bullets: [
      'Wi-Fi, check-in, parking and checkout details',
      'Local recommendations and stay-specific notes',
      'Reusable companion sections hosts can enable, hide or update',
    ],
    about_ticks: [
      'A guest-ready digital stay companion',
      'Built for hosts and property managers',
      'Designed for rooms, apartments, holidays and serviced stays',
    ],
  },
  solutions: [
    {
      slug: 'guest-guide-qr-code',
      title: 'Guest guide QR code',
      description: 'Give guests one QR-friendly guide for the information they need during a stay.',
      icon: 'i-lucide-book-open',
    },
    {
      slug: 'wifi-instructions-page',
      title: 'Wi-Fi instructions page',
      description: 'Publish Wi-Fi details and connection notes in a clean guest-facing page.',
      icon: 'i-lucide-wifi',
    },
    {
      slug: 'house-manual-qr-code',
      title: 'House manual QR code',
      description: 'Turn house rules, appliances, parking, and checkout notes into a shareable guide.',
      icon: 'i-lucide-home',
    },
    {
      slug: 'check-in-instructions-page',
      title: 'Check-in instructions page',
      description: 'Create a simple page for arrival details, key pickup, entry codes, and timing.',
      icon: 'i-lucide-key-round',
    },
    {
      slug: 'local-recommendations-guide',
      title: 'Local recommendations guide',
      description: 'Share nearby places, tips, and host recommendations without repeatedly sending messages.',
      icon: 'i-lucide-map',
    },
  ],
  entities: [
    {
      id: 'Property',
      purpose: 'The room, apartment, holiday, or serviced stay guests are using.',
    },
    {
      id: 'StayCompanion',
      purpose: 'The public mobile experience guests open before or during a stay.',
    },
    {
      id: 'CompanionSection',
      purpose:
        'A reusable stay companion section such as check-in, checkout, parking, emergency, or local recommendations.',
    },
    {
      id: 'GuestMessage',
      purpose: 'A stay-specific welcome message that can later connect to calendar or booking data.',
    },
  ],
  relations_ascii: `
Property
  -> StayCompanion
    -> CompanionSection
    -> GuestMessage

`,
}

export const metaContent = defineFireuxMeta({
  app: {
    id: 'buenohost',
    name: 'BuenoHost',
    ecosystem: 'fireux',
  },
  ...buenoHostLanguage,
})
