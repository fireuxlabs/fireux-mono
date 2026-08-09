import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { miseboxDemoMediaUrl } from 'fireux-demo/runtime/media/misebox'
import type { PlaceStored } from 'fireux-places/runtime/models/place.model'
import {
  hasExactPublicPlaceProjectionShape,
  normalizePublicPlaceProjection,
} from 'fireux-places/runtime/utils/public-place-projection'
import { CompanyDefaults, type Company } from '../../models/company.model'
import type { PublicCompanyProjection } from '../../models/company-public.model'

const stamp: FirebaseTimestamp = {
  seconds: 1_784_534_400,
  nanoseconds: 0,
}

export type CompanyDemoTarget = {
  company: Company
  place: PlaceStored
  publicCompany: PublicCompanyProjection
}

type CompanyDemoSeed = {
  id: string
  name: string
  brandTagline: string
  city: string
  region: string
  postalCode: string
  imageUrl: string
}

const target = (seed: CompanyDemoSeed): CompanyDemoTarget => {
  const place: PlaceStored = {
    id: seed.id,
    name: seed.name,
    short_name: seed.name,
    brand_tagline: seed.brandTagline,
    place_type: 'physical',
    source: 'manual',
    formatted_address: `${seed.postalCode} ${seed.city}, Switzerland`,
    short_address: seed.city,
    image_url: seed.imageUrl,
    image_shade: 'dark',
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
    created: {
      at: stamp,
      by: 'demo',
    },
    updated: {
      at: stamp,
      by: 'demo',
    },
  }
  const publicCompany = normalizePublicPlaceProjection({ ...place })
  if (
    !publicCompany ||
    !hasExactPublicPlaceProjectionShape({ ...publicCompany })
  ) {
    throw new Error(
      `Company Demo ${seed.id} requires one exact public Place projection.`
    )
  }

  return {
    company: {
      ...CompanyDefaults,
      id: seed.id,
      created: { at: stamp },
      updated: { at: stamp },
    },
    place,
    publicCompany,
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
  }),
  target({
    id: 'pantry-house-hq',
    name: 'Pantry House Warehouse',
    brandTagline: 'Dry goods and pantry distribution',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3000',
    imageUrl: miseboxDemoMediaUrl('places/pantry-house-hq/place.jpg'),
  }),
  target({
    id: 'bern-market-garden-hq',
    name: 'Bern Market Garden',
    brandTagline: 'Market garden and fresh-produce packing',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3013',
    imageUrl: miseboxDemoMediaUrl('places/bern-market-garden-hq/place.jpg'),
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
    item.publicCompany.id !== placeId ||
    !hasExactPublicPlaceProjectionShape({ ...item.publicCompany }) ||
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

export const companyDemoPublicProjections = companyDemoTargets.map(
  (item) => item.publicCompany
)
