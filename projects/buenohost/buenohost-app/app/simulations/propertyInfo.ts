// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: keep the public stay preview sanitized and explicitly simulated.
export type PropertyInfoItem = {
  label?: string
  value: string
  tone?: 'default' | 'important' | 'warning'
}

export type PropertyInfoTopic = {
  id: string
  title: string
  summary: string
  icon: string
  priority?: boolean
  enabled?: boolean
  items: PropertyInfoItem[]
}

export type PropertyInfoTranslationRef = {
  source_app: 'buenohost'
  document_type: 'property-info'
  document_slug: string
  source_language: 'en'
}

export type PropertyInfoCollection = {
  type: 'buenohost-property-info'
  slug: string
  property_id?: string
  language: 'en'
  title: string
  status: 'simulation' | 'live'
  translation_ref: PropertyInfoTranslationRef
  stay_message?: {
    title: string
    subtitle?: string
  }
  privacy_note: string
  footer: string
  topics: PropertyInfoTopic[]
}

export const standardPropertyInfoTopicIds = [
  'welcome',
  'check-in',
  'checkout',
  'emergency',
  'house-rules',
  'apartment-guide',
  'rubbish-recycling',
  'parking',
  'local-guide',
  'updates',
] as const

export const previewStayPropertyInfo: PropertyInfoCollection = {
  type: 'buenohost-property-info',
  slug: 'preview-stay',
  property_id: 'preview-stay',
  language: 'en',
  title: 'Mountain Stay Preview',
  status: 'simulation',
  translation_ref: {
    source_app: 'buenohost',
    document_type: 'property-info',
    document_slug: 'preview-stay',
    source_language: 'en',
  },
  stay_message: {
    title: 'Preview a digital stay companion',
    subtitle: 'This local simulation contains no live property, guest, host or access data.',
  },
  privacy_note:
    'Local product simulation only. No real host, guest, address, contact, network, key or access details are compiled into this preview.',
  footer: 'BuenoHost local preview — nothing here is a live booking or property record.',
  topics: [
    {
      id: 'welcome',
      title: 'Welcome',
      summary: 'How a guest would find the first useful stay details.',
      icon: 'i-lucide-home',
      priority: true,
      enabled: true,
      items: [
        { value: 'Welcome to this fictional BuenoHost product preview.' },
        { label: 'Network details', value: 'Shown only in an authenticated live guest flow.', tone: 'important' },
        { label: 'Host support', value: 'Available through the live property chat when configured.' },
      ],
    },
    {
      id: 'check-in',
      title: 'Check-in',
      summary: 'Example arrival guidance without a location or access credential.',
      icon: 'i-lucide-key-round',
      priority: true,
      enabled: true,
      items: [
        { label: 'Arrival window', value: 'Set by the host in a live stay.', tone: 'important' },
        { label: 'Access', value: 'Secure instructions appear only for an authorised guest.' },
        { value: 'Use live property chat if arrival instructions do not match the stay.' },
      ],
    },
    {
      id: 'checkout',
      title: 'Checkout',
      summary: 'Example departure checklist.',
      icon: 'i-lucide-door-open',
      priority: true,
      enabled: true,
      items: [
        { label: 'Departure time', value: 'Set by the host in a live stay.', tone: 'important' },
        { value: 'Leave the property as requested in its live house manual.' },
        { value: 'Return access items using the private instructions supplied for that stay.' },
      ],
    },
    {
      id: 'emergency',
      title: 'Emergency',
      summary: 'Where verified safety information would appear.',
      icon: 'i-lucide-siren',
      priority: true,
      enabled: true,
      items: [
        { label: 'Emergency services', value: 'Use the verified local number shown for the live property.', tone: 'important' },
        { label: 'Host support', value: 'Use the live property contact channel.' },
        { value: 'Safety equipment locations must be verified by the property owner before publication.' },
      ],
    },
    {
      id: 'house-rules',
      title: 'House Rules',
      summary: 'A structured place for owner-approved expectations.',
      icon: 'i-lucide-clipboard-check',
      enabled: true,
      items: [
        { value: 'Live house rules are supplied and approved by the property owner.' },
        { value: 'The preview does not claim rules for a real accommodation.' },
      ],
    },
    {
      id: 'apartment-guide',
      title: 'Property Guide',
      summary: 'Instructions for heating, appliances and shared facilities.',
      icon: 'i-lucide-info',
      enabled: true,
      items: [
        { value: 'Live appliance and facility instructions belong to the selected property.' },
        { value: 'Owners can keep those notes current without changing the public page layout.' },
      ],
    },
    {
      id: 'rubbish-recycling',
      title: 'Rubbish & Recycling',
      summary: 'Location-specific disposal guidance.',
      icon: 'i-lucide-recycle',
      enabled: true,
      items: [
        { value: 'A live guide shows the property owner’s verified disposal instructions.' },
      ],
    },
    {
      id: 'parking',
      title: 'Parking',
      summary: 'Where verified arrival and parking details would appear.',
      icon: 'i-lucide-car',
      priority: true,
      enabled: true,
      items: [
        { value: 'A live property can publish safe public guidance and reserve exact details for guests.' },
      ],
    },
    {
      id: 'local-guide',
      title: 'Local Guide',
      summary: 'Owner-curated recommendations around a stay.',
      icon: 'i-lucide-map-pin',
      enabled: true,
      items: [
        { value: 'A live guide can list verified shops, transport and local recommendations.' },
      ],
    },
    {
      id: 'updates',
      title: 'Updates',
      summary: 'Current notices for authorised guests.',
      icon: 'i-lucide-megaphone',
      enabled: true,
      items: [
        { value: 'This simulation has no live guest notices.' },
      ],
    },
  ],
}

export const propertyInfoCollections = [previewStayPropertyInfo] as const

export function resolvePropertyInfo(slug: string): PropertyInfoCollection | null {
  return propertyInfoCollections.find((info) => info.slug === slug) ?? null
}

export function getEnabledPropertyInfoTopics(info: PropertyInfoCollection): PropertyInfoTopic[] {
  return info.topics.filter((topic) => topic.enabled !== false)
}

export function getPropertyInfoHome(info: PropertyInfoCollection): PropertyInfoTopic | null {
  return getEnabledPropertyInfoTopics(info).find((topic) => topic.id === 'welcome') ?? null
}

export function getPropertyInfoSections(info: PropertyInfoCollection): PropertyInfoTopic[] {
  const home = getPropertyInfoHome(info)
  return getEnabledPropertyInfoTopics(info).filter((topic) => topic.id !== home?.id)
}

export function resolvePropertyInfoSection(slug: string, infoId: string): PropertyInfoTopic | null {
  const info = resolvePropertyInfo(slug)
  if (!info) return null

  return getPropertyInfoSections(info).find((topic) => topic.id === infoId) ?? null
}
