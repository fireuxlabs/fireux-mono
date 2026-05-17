import { PropertyManualModel } from 'fireux-properties/runtime/models/property.model'
import type { PropertyIdentity, PropertyManual } from 'fireux-properties/runtime/models/property.model'

export type DemoBuenoHostAddressMode = 'area' | 'street' | 'exact'
export type DemoBuenoHostContactMode = 'chat' | 'email' | 'phone' | 'whatsapp'

export type DemoBuenoHostPublicProperty = {
  id: string
  slug: string
  portfolio_id: string
  identity: PropertyIdentity
  manual: PropertyManual
  address_mode: DemoBuenoHostAddressMode
  contact_mode: DemoBuenoHostContactMode
  booking_mode: 'enquiry'
  status: 'active' | 'inactive'
  headline: string
  summary: string
  price_hint: string
  availability_hint: string
  amenities: string[]
  public_notes: string[]
}

const manual = (input: Partial<PropertyManual> = {}): PropertyManual => ({
  ...(JSON.parse(JSON.stringify(PropertyManualModel)) as PropertyManual),
  ...input,
})

export const demoBuenoHostPublicProperties: DemoBuenoHostPublicProperty[] = [
  {
    id: 'demo-stay',
    slug: 'demo-stay',
    portfolio_id: 'buenohost-demo-properties',
    identity: {
      name: 'Luxurious Mountain Chalet',
      address_line: 'Demo address hidden for public sample',
      city: 'Example alpine stay',
      postcode: '',
      country: 'Switzerland',
      place_id: 'demo-stay',
      image_url:
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
      property_type: 'residential',
      unit_count: 1,
      estimated_value: 0,
      estimated_value_currency: 'CHF',
    },
    manual: manual({
      welcome: {
        ...PropertyManualModel.welcome,
        welcome_note: 'Welcome to Luxurious Mountain Chalet.',
        manager: 'Demo Host',
        phone: '+41 00 000 00 00',
        email: 'hello@example.invalid',
        address: 'Example alpine stay',
        wifi_network: 'DemoStay Guest',
        wifi_password: 'demo-stay-2026',
      },
    }),
    address_mode: 'area',
    contact_mode: 'chat',
    booking_mode: 'enquiry',
    status: 'active',
    headline: 'Public sample stay companion for the BuenoHost landing page.',
    summary:
      'A fictional alpine property that shows how a house manual becomes a mobile stay companion without exposing a real host or address.',
    price_hint: 'Demo only',
    availability_hint: 'Demo only',
    amenities: ['Wi-Fi', 'Stay companion', 'Check-in notes', 'Parking', 'Local recommendations'],
    public_notes: [
      'This is a fictional public sample for product demonstration.',
      'No real guest, host, address or access details are shown.',
    ],
  },
  {
    id: 'holiday-with-nats',
    slug: 'holiday-with-nats',
    portfolio_id: 'buenohost-live-properties',
    identity: {
      name: 'Penthouse Holiday Apartment',
      address_line: 'Hobachergassli',
      city: 'Matten bei Interlaken',
      postcode: '3800',
      country: 'Switzerland',
      place_id: 'holiday-with-nats',
      image_url:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
      property_type: 'residential',
      unit_count: 1,
      estimated_value: 0,
      estimated_value_currency: 'CHF',
    },
    manual: manual({
      welcome: {
        ...PropertyManualModel.welcome,
        welcome_note: 'Welcome to the Penthouse Holiday Apartment.',
        manager: 'Apartment Manager Natalie',
        phone: '+41 78 604 69 00',
        email: 'bookwithnats@gmail.com',
        address: 'Modern Penthouse Apartment, Hobachergassli, 3800 Matten bei Interlaken',
        wifi_network: 'Penthouse',
        wifi_password: 'penthouse2020',
      },
    }),
    address_mode: 'exact',
    contact_mode: 'chat',
    booking_mode: 'enquiry',
    status: 'active',
    headline: 'Manual-backed stay companion for a real short-stay apartment.',
    summary:
      'Local proof property built from the source house manual. Missing booking, pricing and arrival details are flagged for host confirmation.',
    price_hint: 'Ask host',
    availability_hint: 'Ask host',
    amenities: ['Wi-Fi', 'Stay companion', 'Kitchen', 'Parking', 'Local transport'],
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
