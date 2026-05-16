import { defineFireuxMeta } from 'fireux-core/runtime/models/system/meta-content.model'

export const buenoHostProductSentence =
  'Digital stay companions for rooms, apartments, holidays, and serviced stays.'

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
      'BuenoHost turns any room, apartment or holiday into a <strong>digital stay companion</strong> with clear property pages for your guests.',
    promise_html:
      'Hosts keep Wi-Fi, check-in details, parking, house rules, checkout notes, emergency contacts, and local recommendations in one clean guest-facing experience.',
    console_bridge_html:
      'A standalone FireUX app for structured guest information on top of the shared fireux-properties engine. BuenoHost owns the property-facing stay companion experience, with optional services able to connect later.',
    about_p1:
      'BuenoHost is for hosts and property managers who want clearer guest arrivals, fewer repeated questions, and a more professional stay experience.',
    about_p2:
      'The MVP starts with public property pages, then grows into editable host tools for reusable property information, local recommendations, and stay-specific notes.',
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
      label: 'View demo property',
      to: '/properties/demo-stay',
    },
    secondary: {
      label: 'View property pages',
      to: '/properties/demo-stay/pages',
    },
    console: {
      label: 'View property pages',
      to: '/properties/demo-stay/pages',
    },
  },
  lists: {
    hero_bullets: [
      'Wi-Fi, check-in, parking and checkout details',
      'Local recommendations and stay-specific notes',
      'Reusable pages hosts can enable, hide or update',
    ],
    about_ticks: [
      'A guest-ready digital stay companion',
      'Built for hosts and property managers',
      'Designed for rooms, apartments, holidays and serviced stays',
    ],
  },
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
      id: 'PropertyPage',
      purpose:
        'A reusable guest information topic such as Wi-Fi, check-in, checkout, parking, or local recommendations.',
    },
    {
      id: 'GuestMessage',
      purpose: 'A stay-specific welcome message that can later connect to calendar or booking data.',
    },
  ],
  relations_ascii: `
Property
  -> StayCompanion
    -> PropertyPage
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
