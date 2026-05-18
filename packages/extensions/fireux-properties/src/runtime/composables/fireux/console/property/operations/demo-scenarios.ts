import { PropertyManualModel } from '../../../../../models/property.model'
import type { Property, PropertyIdentity } from '../../../../../models/property.model'

const stamp = () => ({
  at: {} as any,
  by: undefined,
  app_id: undefined,
})

const updateStamp = () => ({
  at: {} as any,
  by: undefined,
})

type PropertySeed = Omit<Property, 'created' | 'updated' | 'operator_ids' | 'slug'> & {
  operator_ids?: string[]
  slug?: string
}

const toProperty = (seed: PropertySeed): Property => ({
  ...seed,
  slug: seed.slug ?? seed.id,
  operator_ids: seed.operator_ids ?? [],
  created: stamp(),
  updated: updateStamp(),
})

const identity = (input: PropertyIdentity): PropertyIdentity => input

const manual = (): Property['manual'] =>
  JSON.parse(JSON.stringify(PropertyManualModel)) as Property['manual']

export const getDemoPropertySimulations = (): Property[] => [
  toProperty({
    id: 'alpine-apartment-demo',
    portfolio_id: 'buenohost-demo-properties',
    identity: identity({
      name: 'Alpine View Residence',
      address_line: '8 Chaletstrasse',
      city: 'Interlaken',
      postcode: '3800',
      country: 'Switzerland',
      place_id: 'demo-alpine-apartment',
      image_url:
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=640&h=360&q=80',
      property_type: 'residential',
      unit_count: 1,
      estimated_value: 0,
      estimated_value_currency: 'CHF',
    }),
    manual: manual(),
    status: 'active',
  }),
  toProperty({
    id: 'city-guest-room-demo',
    portfolio_id: 'buenohost-demo-properties',
    identity: identity({
      name: 'City Guest Room',
      address_line: '18 Tib Street',
      city: 'Manchester',
      postcode: 'M1 1AA',
      country: 'United Kingdom',
      place_id: 'demo-city-guest-room',
      image_url:
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=640&h=360&q=80',
      property_type: 'residential',
      unit_count: 1,
      estimated_value: 0,
      estimated_value_currency: 'GBP',
    }),
    manual: manual(),
    status: 'active',
  }),
  toProperty({
    id: 'lakeside-holiday-home-demo',
    portfolio_id: 'buenohost-demo-properties',
    identity: identity({
      name: 'Lakeside Holiday Home',
      address_line: '14 Seestrasse',
      city: 'Thun',
      postcode: '3600',
      country: 'Switzerland',
      place_id: 'demo-lakeside-holiday-home',
      image_url:
        'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&w=640&h=360&q=80',
      property_type: 'residential',
      unit_count: 1,
      estimated_value: 0,
      estimated_value_currency: 'CHF',
    }),
    manual: manual(),
    status: 'active',
  }),
]

export const createTestPropertySimulation = (
  userId: string,
  displayName = '',
  imageUrl = ''
): Property | null => {
  if (!userId) return null

  const owner = displayName || `User ${userId.slice(0, 6)}`

  return toProperty({
    id: userId,
    portfolio_id: 'test-property',
    operator_ids: [userId],
    identity: identity({
      name: `${owner}'s Test Property`,
      address_line: 'Test address',
      city: 'Test City',
      postcode: 'TEST',
      country: 'Test Country',
      place_id: `test-property-${userId}`,
      image_url: imageUrl,
      property_type: 'residential',
      unit_count: 1,
      estimated_value: 0,
      estimated_value_currency: 'GBP',
    }),
    manual: manual(),
    status: 'active',
  })
}
