import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/utils/media/misebox'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type { Company } from '../../models/company.model.ts'

const stamp: FirebaseTimestamp = {
  seconds: 1_784_534_400,
  nanoseconds: 0,
}

export type CompanyDemoTarget = {
  company: Company
  place: Partial<Place> & Pick<Place, 'id' | 'name' | 'place_type' | 'source'>
  resolvedPlace: Place
}

type CompanyDemoSeed = {
  id: string
  name: string
  brandTagline: string
  city: string
  region: string
  postalCode: string
  imageUrl: string
  logoImageUrl: string
}

const target = (seed: CompanyDemoSeed): CompanyDemoTarget => {
  const place: CompanyDemoTarget['place'] = {
    id: seed.id,
    name: seed.name,
    short_name: seed.name,
    brand_tagline: seed.brandTagline,
    place_type: 'physical',
    source: 'manual',
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
    types: ['company'],
    tags: ['demo', 'supplier-company'],
    slug: seed.id,
  }
  const resolvedPlace = normalizePlace(seed.id, place)
  if (!resolvedPlace) {
    throw new Error(`Company Demo ${seed.id} requires one canonical Place.`)
  }

  return {
    company: {
      id: seed.id,
      created: { at: stamp },
      updated: { at: stamp },
    },
    place,
    resolvedPlace,
  }
}

export const companyDemoTargets: CompanyDemoTarget[] = [
  target({
    id: 'alpine-foodservice-hq',
    name: 'Alpine Foodservice Depot',
    brandTagline: 'Cold-chain foodservice distribution',
    city: 'Interlaken',
    region: 'Bern',
    postalCode: '3800',
    imageUrl: miseboxDemoMediaUrl('places/alpine-foodservice-hq/place.jpg'),
    logoImageUrl: miseboxDemoMediaUrl('suppliers/alpine-foodservice/logo.png'),
  }),
  target({
    id: 'pantry-house-hq',
    name: 'Pantry House Warehouse',
    brandTagline: 'Dry goods and pantry distribution',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3000',
    imageUrl: miseboxDemoMediaUrl('places/pantry-house-hq/place.jpg'),
    logoImageUrl: miseboxDemoMediaUrl('suppliers/pantry-house/logo.png'),
  }),
  target({
    id: 'bern-market-garden-hq',
    name: 'Bern Market Garden',
    brandTagline: 'Market garden and fresh-produce packing',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3013',
    imageUrl: miseboxDemoMediaUrl('places/bern-market-garden-hq/place.jpg'),
    logoImageUrl: miseboxDemoMediaUrl('suppliers/bern-market-garden/logo.png'),
  }),
]

const companyIds = new Set<string>()
const companyKeys = ['created', 'id', 'updated']

for (const item of companyDemoTargets) {
  const companyId = String(item.company.id || '').trim()
  const placeId = String(item.place.id || '').trim()
  if (
    !companyId ||
    companyIds.has(companyId) ||
    companyId !== placeId ||
    item.resolvedPlace.id !== placeId ||
    !item.place.name ||
    !item.place.image_url ||
    item.place.place_type !== 'physical' ||
    item.place.source !== 'manual' ||
    Object.keys(item.company)
      .sort()
      .some((key, index) => key !== companyKeys[index]) ||
    Object.keys(item.company).length !== companyKeys.length
  ) {
    throw new Error(
      `Company Demo ${companyId || '(missing-id)'} requires one stamps-only Company and same-id sparse Place root.`
    )
  }
  companyIds.add(companyId)
}

export const companyDemoRecords = companyDemoTargets.map((item) => item.company)

export const companyDemoPlaces = companyDemoTargets.map((item) => item.place)

export const companyDemoResolvedPlaces = companyDemoTargets.map(
  (item) => item.resolvedPlace
)
