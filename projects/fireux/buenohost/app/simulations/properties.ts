// Concurrent edit — 2026-07-20 17:03 CEST — Demo Data Spine pass: retain one sanitized app-local property simulation.
// Concurrent edit — 2026-07-20 22:20 CEST — Both-Entity Authority — Property: keep preview address fields app-local and reference Place explicitly.
import { PropertyManualModel } from 'fireux-properties/runtime/models/property.model'
import type { PropertyIdentity, PropertyManual } from 'fireux-properties/runtime/models/property.model'

export type BuenoHostSimulationAddressMode = 'area' | 'street' | 'exact'
export type BuenoHostSimulationContactMode = 'chat' | 'email' | 'phone' | 'whatsapp'

type BuenoHostSimulationIdentity = PropertyIdentity & {
  address_line: string
  city: string
  postcode: string
  country: string
}

export type BuenoHostSimulatedProperty = {
  id: string
  slug: string
  portfolio_id: string
  place_id: string
  identity: BuenoHostSimulationIdentity
  manual: PropertyManual
  address_mode: BuenoHostSimulationAddressMode
  contact_mode: BuenoHostSimulationContactMode
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

export const simulatedBuenoHostProperties: BuenoHostSimulatedProperty[] = [
  {
    id: 'preview-stay',
    slug: 'preview-stay',
    portfolio_id: 'buenohost-preview-properties',
    place_id: 'preview-stay',
    identity: {
      name: 'Mountain Stay Preview',
      address_line: 'Location shown after booking',
      city: 'Sample Alpine Region',
      postcode: '',
      country: 'Switzerland',
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
        welcome_note: 'Welcome to this fictional BuenoHost preview.',
        manager: 'Preview host',
        phone: '',
        email: '',
        address: 'Location shown after booking',
        wifi_network: 'Shown after booking',
        wifi_password: 'Shown after booking',
      },
    }),
    address_mode: 'area',
    contact_mode: 'chat',
    booking_mode: 'enquiry',
    status: 'active',
    headline: 'Local preview of a BuenoHost stay companion.',
    summary:
      'A fictional property simulation that shows the public experience without representing a live property or exposing host, address, contact, network or access details.',
    price_hint: 'Illustrative pricing only',
    availability_hint: 'No live availability',
    amenities: ['Stay companion', 'Check-in notes', 'Parking', 'Local recommendations'],
    public_notes: [
      'Local product simulation only; this is not a live property listing.',
      'No booking, message or enquiry is sent from this preview.',
    ],
  },
]

export function findSimulatedBuenoHostProperty(slug: string) {
  const normalizedSlug = slug.trim().toLowerCase()
  return simulatedBuenoHostProperties.find((property) => property.slug === normalizedSlug) ?? null
}
