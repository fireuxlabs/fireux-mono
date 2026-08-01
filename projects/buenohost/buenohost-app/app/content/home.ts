export type IntegrationAppKey = 'fireux' | 'misebox' | 'werkbox' | 'sproochli' | 'findMySeo'

export type PublicAppInfo = {
  app?: {
    social_links?: {
      website?: string
    }
    media?: {
      logo_url?: string
      wordmark_dark_url?: string
      wordmark_light_url?: string
    }
  }
}

export type IntegrationCard = {
  title: string
  description: string
  icon: string
  href?: string
  appKey?: IntegrationAppKey
}

export const previewInfoPath = '/properties/preview-stay/info'

export const stickerTopics = [
  'Welcome',
  'Check-in',
  'Parking',
  'Checkout',
  'House rules',
  'Local recommendations',
]

export const guestAppPreview = [
  {
    title: 'Welcome',
    description: 'Arrival note, Wi-Fi, host contact and first steps.',
    icon: 'i-lucide-hand-heart',
  },
  {
    title: 'Check-in & checkout',
    description: 'Access, keys, parking, arrival details and departure steps.',
    icon: 'i-lucide-key-round',
  },
  {
    title: 'Emergency',
    description: 'Urgent numbers, medical help and safety equipment.',
    icon: 'i-lucide-siren',
  },
  {
    title: 'Local Recommendations',
    description: 'Shops, transport and nearby recommendations.',
    icon: 'i-lucide-map-pin',
  },
]

export const extraInfoBullets = [
  'House rules',
  'Rubbish and recycling',
  'Appliance manuals',
  'Heating and air con instructions',
  'Live updates',
  'Laundry instructions',
  'TV and streaming',
  'Balcony and outdoor notes',
]

export const pricingPlans = [
  {
    id: 'buenohost',
    title: 'BuenoHost',
    description: 'Includes your first property and two room QR codes.',
    price: '£10',
    billingPeriod: '/ month',
    highlight: true,
    scale: true,
    features: [
      '1 property',
      '2 rooms (if required)',
      'AI-ready document processing',
      'Operational host console',
      'Hosted guest URL and QR tools',
    ],
    button: {
      label: 'Start with BuenoHost',
      to: '#upload',
      color: 'primary',
      variant: 'solid',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'extra-properties',
    title: 'Extra Properties',
    description: 'Add additional properties to the same BuenoHost account.',
    price: '+ £5',
    billingPeriod: '/ month',
    features: [
      'Add more properties',
      'Separate URLs and QR codes',
      'Reusable or specific manual sections',
      'Property-level stay companion',
      'Account-level overview later',
    ],
    button: {
      label: 'Add additional property',
      to: '#upload',
      color: 'neutral',
      variant: 'soft',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
  {
    id: 'room-qr-codes',
    title: 'Extra rooms',
    description: 'Add additional rooms to your properties.',
    price: '+ £2',
    billingPeriod: '/ month',
    features: [
      'Room-specific QR codes',
      'Room notes and instructions',
      'Shared property manual',
      'Different details per room',
      'Useful for guesthouses and shared stays',
    ],
    button: {
      label: 'Add additional Room',
      to: '#upload',
      color: 'neutral',
      variant: 'soft',
      trailingIcon: 'i-lucide-arrow-right',
    },
  },
] as const

export const consoleFeatures = [
  {
    title: 'Out of the box',
    description: 'Start with ready-made sections for welcome, check-in, emergency and local recommendations.',
    icon: 'i-lucide-layout-list',
  },
  {
    title: 'Create your own',
    description: 'Tailor your manual with custom sections for anything your property, building or room needs.',
    icon: 'i-lucide-square-plus',
  },
  {
    title: 'Welcome',
    description: 'Set the first message guests see with arrival notes, Wi-Fi, host contact and key first steps.',
    icon: 'i-lucide-message-square-heart',
  },
  {
    title: 'Publish',
    description: 'Push new information to your QR code without reprinting the manual.',
    icon: 'i-lucide-qr-code',
  },
] as const

export const integrationCards: IntegrationCard[] = [
  {
    title: 'Google Calendar',
    description: 'Use booking dates to update check-in, checkout and personalised welcome messages.',
    icon: 'i-logos-google-calendar',
    href: 'https://calendar.google.com',
  },
  {
    title: 'Sproochli',
    description: 'Translate guest information into multiple languages.',
    icon: 'i-lucide-languages',
    appKey: 'sproochli',
  },
  {
    title: 'Misebox',
    description: 'Let guests discover local private chefs and hospitality services.',
    icon: 'i-lucide-chef-hat',
    appKey: 'misebox',
  },
  {
    title: 'Find My SEO',
    description: 'Work with SEO specialists to promote your stay companion beyond booking platforms.',
    icon: 'i-lucide-search-check',
    appKey: 'findMySeo',
  },
  {
    title: 'Werkbox',
    description: 'Explore cleaning work and service providers through the shared practical-work hub.',
    icon: 'i-lucide-spray-can',
    appKey: 'werkbox',
  },
  {
    title: 'FireUX',
    description: 'Build a custom hosting platform or property experience with FireUX.',
    icon: 'i-lucide-flame',
    appKey: 'fireux',
  },
]
