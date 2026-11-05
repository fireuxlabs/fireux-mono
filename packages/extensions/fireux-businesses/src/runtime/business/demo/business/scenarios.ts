import { normalizeBusiness } from '../../utils/normalize-business'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/utils/media/misebox'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type { Business } from '../../models/business.model.ts'

const stamp: FirebaseTimestamp = {
  seconds: 1_784_534_400,
  nanoseconds: 0,
}

export type BusinessDemoTarget = {
  business: Business
  place: Partial<Place> & Pick<Place, 'id' | 'name' | 'place_type'>
  resolvedPlace: Place
}

type BusinessDemoSeed = {
  id: string
  name: string
  tagline: string
  city: string
  region: string
  postalCode: string
  imageUrl: string
  logoImageUrl: string
}

const target = (seed: BusinessDemoSeed): BusinessDemoTarget => {
  const place: BusinessDemoTarget['place'] = {
    id: seed.id,
    name: seed.name,
    short_name: seed.name,
    tagline: seed.tagline,
    place_type: 'physical',
    formatted_address: `${seed.postalCode} ${seed.city}, Switzerland`,
    short_address: seed.city,
    image_url: seed.imageUrl,
    logo_image: seed.logoImageUrl,
    verified: false,
    address: {
      street: '',
      city: seed.city,
      region: seed.region,
      postal_code: seed.postalCode,
      country_code: 'CH',
    },
    timezone: 'Europe/Zurich',
    default_currency_code: 'CHF',
    types: ['business'],
    tags: ['demo', 'supplier-business'],
    slug: seed.id,
  }
  const resolvedPlace = normalizePlace(seed.id, place)
  if (!resolvedPlace) {
    throw new Error(`Business Demo ${seed.id} requires one canonical Place.`)
  }

  return {
    business: {
      id: seed.id, name: seed.name, description: seed.tagline, email: '', phone: '', website: '', place_ids: [seed.id], management: { mode: 'root' },
      created: { at: stamp },
      updated: { at: stamp },
    },
    place,
    resolvedPlace,
  }
}

export const businessDemoTargets: BusinessDemoTarget[] = [
  target({
    id: 'alpine-foodservice-hq',
    name: 'Alpine Foodservice Depot',
    tagline: 'Cold-chain foodservice distribution',
    city: 'Interlaken',
    region: 'Bern',
    postalCode: '3800',
    imageUrl: miseboxDemoMediaUrl('places/alpine-foodservice-hq/place.jpg'),
    logoImageUrl: miseboxDemoMediaUrl('suppliers/alpine-foodservice/logo.png'),
  }),
  target({
    id: 'pantry-house-hq',
    name: 'Pantry House Warehouse',
    tagline: 'Dry goods and pantry distribution',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3000',
    imageUrl: miseboxDemoMediaUrl('places/pantry-house-hq/place.jpg'),
    logoImageUrl: miseboxDemoMediaUrl('suppliers/pantry-house/logo.png'),
  }),
  target({
    id: 'bern-market-garden-hq',
    name: 'Bern Market Garden',
    tagline: 'Market garden and fresh-produce packing',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3013',
    imageUrl: miseboxDemoMediaUrl('places/bern-market-garden-hq/place.jpg'),
    logoImageUrl: miseboxDemoMediaUrl('suppliers/bern-market-garden/logo.png'),
  }),
]

const businessIds = new Set<string>()


for (const item of businessDemoTargets) {
  const businessId = String(item.business.id || '').trim()
  const placeId = String(item.place.id || '').trim()
  if (
    !businessId ||
    businessIds.has(businessId) ||
    !item.business.place_ids.includes(placeId) ||
    item.resolvedPlace.id !== placeId ||
    !item.place.name ||
    !item.place.image_url ||
    item.place.place_type !== 'physical' ||
    !normalizeBusiness(businessId, Object.fromEntries(Object.entries(item.business).filter(([key]) => key !== 'id')))
  ) {
    throw new Error(
      `Business Demo ${businessId || '(missing-id)'} requires a canonical Business and explicitly linked Place.`
    )
  }
  businessIds.add(businessId)
}

export const businessDemoRecords = businessDemoTargets.map((item) => item.business)

export const businessDemoPlaces = businessDemoTargets.map((item) => item.place)

export const businessDemoResolvedPlaces = businessDemoTargets.map(
  (item) => item.resolvedPlace
)
