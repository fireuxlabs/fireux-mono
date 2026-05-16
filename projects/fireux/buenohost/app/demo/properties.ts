export type DemoBuenoHostAddressMode = 'area' | 'street' | 'exact'
export type DemoBuenoHostContactMode = 'chat' | 'email' | 'phone' | 'whatsapp'

export type DemoBuenoHostPublicProperty = {
  id: string
  slug: string
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
    id: 'demo-stay',
    slug: 'demo-stay',
    name: 'Luxurious Mountain Chalet',
    location_label: 'Example alpine stay',
    address_display: 'Demo address hidden for public sample',
    address_mode: 'area',
    manager_name: 'Demo Host',
    contact_mode: 'chat',
    booking_mode: 'enquiry',
    headline: 'Public sample property info for the BuenoHost landing page.',
    summary:
      'A fictional alpine property that shows how a house manual becomes a mobile stay companion without exposing a real host or address.',
    price_hint: 'Demo only',
    availability_hint: 'Demo only',
    image_url:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Wi-Fi', 'Property info', 'Check-in notes', 'Parking', 'Local recommendations'],
    public_notes: [
      'This is a fictional public sample for product demonstration.',
      'No real guest, host, address or access details are shown.',
    ],
  },
  {
    id: 'holiday-with-nats',
    slug: 'holiday-with-nats',
    name: 'Penthouse Holiday Apartment',
    location_label: 'Matten bei Interlaken, Switzerland',
    address_display: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
    address_mode: 'exact',
    manager_name: 'Apartment Manager Natalie',
    contact_mode: 'chat',
    booking_mode: 'enquiry',
    headline: 'Manual-backed property info for a real short-stay apartment.',
    summary:
      'Local proof property built from the source house manual. Missing booking, pricing and arrival details are flagged for host confirmation.',
    price_hint: 'Ask host',
    availability_hint: 'Ask host',
    image_url:
      'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    amenities: ['Wi-Fi', 'Property info', 'Kitchen', 'Parking', 'Local transport'],
    public_notes: [
      'Phone, email and address are present in the manual and need confirmation before a live public launch.',
      'Check-in time and building entry steps are missing from the source manual.',
      'Pricing, availability and booking terms are not in the source manual.',
    ],
  },
]

export function findDemoBuenoHostPublicProperty(slug: string) {
  const normalizedSlug = String(slug || '').trim()
  return demoBuenoHostPublicProperties.find((property) => property.slug === normalizedSlug) ?? null
}
