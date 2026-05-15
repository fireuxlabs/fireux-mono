export type BnbGuideItem = {
  label?: string
  value: string
  tone?: 'default' | 'important' | 'warning'
}

export type BnbGuideSection = {
  id: string
  title: string
  summary: string
  icon: string
  priority?: boolean
  enabled?: boolean
  items: BnbGuideItem[]
}

export type BnbGuideTranslationRef = {
  source_app: 'buenohost'
  document_type: 'bnb-guide'
  document_slug: string
  source_language: 'en'
}

export type BnbGuide = {
  type: 'buenohost-bnb-guide'
  slug: string
  language: 'en'
  title: string
  status: 'demo' | 'live'
  translation_ref: BnbGuideTranslationRef
  guest_message?: {
    title: string
    subtitle?: string
  }
  property: {
    name: string
    type: string
    original_language: 'en'
    primary_language: 'en'
    manager: string
    phone: string
    email: string
    address: string
  }
  privacy_note: string
  footer: string
  sections: BnbGuideSection[]
}

export const standardBnbTopicIds = [
  'emergency',
  'wifi',
  'check-in',
  'checkout',
  'keys',
  'house-rules',
  'quiet-hours',
  'smoking',
  'heating-cooling',
  'kitchen',
  'appliances',
  'laundry',
  'bathroom',
  'parking',
  'rubbish-recycling',
  'shops',
  'restaurants',
  'transport',
  'things-to-do',
  'useful-contacts',
] as const

export const alpineViewDemoGuide: BnbGuide = {
  type: 'buenohost-bnb-guide',
  slug: 'alpine-view-demo',
  language: 'en',
  title: 'Alpine View Demo Stay',
  status: 'demo',
  translation_ref: {
    source_app: 'buenohost',
    document_type: 'bnb-guide',
    document_slug: 'alpine-view-demo',
    source_language: 'en',
  },
  guest_message: {
    title: 'Welcome to Alpine View',
    subtitle: 'Sample stay: Friday - Monday',
  },
  property: {
    name: 'Alpine View Apartment',
    type: 'Demo BNB / guest guide',
    original_language: 'en',
    primary_language: 'en',
    manager: 'BuenoHost Demo Team',
    phone: '+41 31 555 01 23',
    email: 'demo@buenohost.app',
    address: 'Sample Chaletstrasse 8, 3800 Interlaken',
  },
  privacy_note:
    'Demo-safe content only. Replace with live host details after the guest guide is attached to a real property.',
  footer: 'Powered by BuenoHost.',
  sections: [
    {
      id: 'welcome',
      title: 'Welcome',
      summary: 'A calm first screen with the stay basics guests usually need first.',
      icon: 'i-lucide-home',
      enabled: true,
      items: [
        { value: 'Welcome to Alpine View Apartment. This sample guide shows the BuenoHost guest experience.' },
        { label: 'Host', value: 'BuenoHost Demo Team' },
        { label: 'Phone', value: '+41 31 555 01 23', tone: 'important' },
        { label: 'Email', value: 'demo@buenohost.app', tone: 'important' },
        { label: 'Address', value: 'Sample Chaletstrasse 8, 3800 Interlaken' },
      ],
    },
    {
      id: 'emergency',
      title: 'Emergency',
      summary: 'Safety equipment and urgent numbers in one obvious place.',
      icon: 'i-lucide-siren',
      priority: true,
      enabled: true,
      items: [
        { value: 'Smoke alarms are installed in the hallway and living room.' },
        { value: 'Fire extinguisher: inside the entrance cupboard.' },
        { value: 'First aid kit: kitchen drawer beside the sink.' },
        { label: 'Police', value: '117', tone: 'important' },
        { label: 'Fire Department', value: '118', tone: 'important' },
        { label: 'Ambulance', value: '144', tone: 'important' },
        { label: 'Host support', value: '+41 31 555 01 23', tone: 'important' },
      ],
    },
    {
      id: 'wifi',
      title: 'Wi-Fi',
      summary: 'Demo network details for the public guide preview.',
      icon: 'i-lucide-wifi',
      priority: true,
      enabled: true,
      items: [
        { label: 'Network', value: 'BuenoHost Demo', tone: 'important' },
        { label: 'Password', value: 'demo-stay-2026', tone: 'important' },
      ],
    },
    {
      id: 'check-in',
      title: 'Check-in',
      summary: 'Arrival steps that prevent repeated host messages.',
      icon: 'i-lucide-door-closed',
      priority: true,
      enabled: true,
      items: [
        { value: 'Check-in is available from 15:00.' },
        { value: 'Use the building code from your booking message to enter the lobby.' },
        { value: 'The apartment is on the second floor; take the lift or stairs.' },
      ],
    },
    {
      id: 'checkout',
      title: 'Checkout',
      summary: 'A short departure checklist for guests.',
      icon: 'i-lucide-door-open',
      priority: true,
      enabled: true,
      items: [
        { value: 'Check out by 10:00 unless agreed otherwise.', tone: 'important' },
        { value: 'Load used dishes into the dishwasher and start a short cycle.' },
        { value: 'Close windows and switch off lights before leaving.' },
        { value: 'Return the key to the lockbox and scramble the code.', tone: 'warning' },
      ],
    },
    {
      id: 'keys',
      title: 'Keys & Access',
      summary: 'Demo-safe access instructions for a guest-facing page.',
      icon: 'i-lucide-key-round',
      priority: true,
      enabled: true,
      items: [
        { value: 'The lockbox is mounted beside the apartment door.' },
        { label: 'Demo code', value: '2468', tone: 'important' },
        { value: 'Live guides should only show real access codes to confirmed guests.', tone: 'warning' },
      ],
    },
    {
      id: 'house-rules',
      title: 'House Rules',
      summary: 'Plain-language expectations for the stay.',
      icon: 'i-lucide-clipboard-check',
      enabled: true,
      items: [
        { value: 'Quiet hours are 22:00-07:00.' },
        { value: 'No smoking inside the apartment.' },
        { value: 'Please remove outdoor shoes in wet weather.' },
        { value: 'Report damage or maintenance issues as soon as possible.' },
      ],
    },
    {
      id: 'heating-cooling',
      title: 'Heating & Cooling',
      summary: 'Keep the apartment comfortable without wasting energy.',
      icon: 'i-lucide-thermometer',
      enabled: true,
      items: [
        { value: 'Radiators can be adjusted in each room.' },
        { value: 'Please do not heat the apartment with windows open.', tone: 'warning' },
        { value: 'Set radiators to low before checkout.' },
      ],
    },
    {
      id: 'kitchen',
      title: 'Kitchen',
      summary: 'Appliance and food storage basics.',
      icon: 'i-lucide-utensils',
      enabled: true,
      items: [
        { value: 'Dishwasher tabs are stored under the sink.' },
        { value: 'Only use dishwasher tabs in the dishwasher.', tone: 'warning' },
        { value: 'Coffee pods and tea are complimentary starter supplies.' },
      ],
    },
    {
      id: 'parking',
      title: 'Parking',
      summary: 'Simple parking instructions for arriving guests.',
      icon: 'i-lucide-car',
      enabled: true,
      items: [
        { value: 'One visitor parking bay is available behind the building.' },
        { label: 'Space', value: 'Demo Bay 12' },
        { value: 'Do not park in numbered resident spaces.', tone: 'warning' },
      ],
    },
    {
      id: 'rubbish-recycling',
      title: 'Rubbish & Recycling',
      summary: 'Waste instructions that reduce checkout confusion.',
      icon: 'i-lucide-recycle',
      enabled: true,
      items: [
        { value: 'General rubbish bags are under the sink.' },
        { value: 'Glass, cardboard and PET go in the labelled recycling bins.' },
        { value: 'Please do not leave food waste in the apartment after checkout.' },
      ],
    },
    {
      id: 'shops',
      title: 'Shops',
      summary: 'Nearby basics for the first day.',
      icon: 'i-lucide-shopping-basket',
      enabled: true,
      items: [
        { value: 'Small grocery: 4 minutes on foot.' },
        { value: 'Pharmacy: 7 minutes on foot.' },
        { value: 'Train station supermarket: open later than most local shops.' },
      ],
    },
    {
      id: 'transport',
      title: 'Transport',
      summary: 'Easy public transport and walking pointers.',
      icon: 'i-lucide-train',
      enabled: true,
      items: [
        { label: 'Bus stop', value: 'Sampleplatz, 3 minutes on foot.' },
        { label: 'Train station', value: 'Interlaken West, 12 minutes on foot.' },
        { value: 'Use the local guest card for eligible transport discounts.' },
      ],
    },
  ],
}

export const bnbGuides = [alpineViewDemoGuide] as const

export function resolveBnbGuide(slug: string): BnbGuide | null {
  return bnbGuides.find((guide) => guide.slug === slug) ?? null
}

export function getEnabledBnbSections(guide: BnbGuide): BnbGuideSection[] {
  return guide.sections.filter((section) => section.enabled !== false)
}

export function getBnbGuestTopics(guide: BnbGuide): BnbGuideSection[] {
  return getEnabledBnbSections(guide).filter((section) => section.id !== 'welcome')
}

export function resolveBnbSection(slug: string, sectionId: string): BnbGuideSection | null {
  const guide = resolveBnbGuide(slug)
  if (!guide) return null

  return getBnbGuestTopics(guide).find((section) => section.id === sectionId) ?? null
}
