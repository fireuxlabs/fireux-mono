export type DemoBuenoHostAddressMode = 'area' | 'street' | 'exact'
export type DemoBuenoHostContactMode = 'chat' | 'email' | 'phone' | 'whatsapp'

export type DemoBuenoHostPublicProperty = {
  id: string
  slug: string
  guide_slug: string
  name: string
  location_label: string
  address_display: string
  address_mode: DemoBuenoHostAddressMode
  manager_name: string
  contact_mode: DemoBuenoHostContactMode
  booking_mode: 'enquiry'
  headline: string
  summary: string
  price_hint: string
  availability_hint: string
  image_url: string
  amenities: string[]
  public_notes: string[]
}

export const demoBuenoHostPublicProperties: DemoBuenoHostPublicProperty[] = [
  {
    id: 'alpine-view-apartment',
    slug: 'alpine-view-apartment',
    guide_slug: 'alpine-view-demo',
    name: 'Alpine View Apartment',
    location_label: 'Interlaken, Switzerland',
    address_display: 'Sample Chaletstrasse 8, 3800 Interlaken',
    address_mode: 'street',
    manager_name: 'BuenoHost Demo Team',
    contact_mode: 'chat',
    booking_mode: 'enquiry',
    headline: 'A calm short-stay apartment with a guest-ready digital guide.',
    summary:
      'Demo public property page for direct enquiries. Guests can ask about dates before exact access details are shared.',
    price_hint: 'Direct enquiry rates available',
    availability_hint: 'Sample spring weekends available',
    image_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Wi-Fi', 'Self check-in', 'Guest guide', 'Kitchen', 'Mountain access'],
    public_notes: [
      'Manager is contactable through BuenoHost.',
      'Exact arrival instructions stay inside the guest guide.',
      'Access codes and private stay notes are never shown on the public page.',
    ],
  },
]

export function findDemoBuenoHostPublicProperty(slug: string) {
  const normalizedSlug = String(slug || '').trim()
  return demoBuenoHostPublicProperties.find((property) => property.slug === normalizedSlug) ?? null
}
