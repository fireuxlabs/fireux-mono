import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { PlaceStored } from 'fireux-places/runtime/models/place.model'
import {
  CompanyModel,
  type Company,
} from '../../models/company.model'

const stamp: FirebaseTimestamp = {
  seconds: 1_784_534_400,
  nanoseconds: 0,
}

export type CompanyDemoTarget = {
  company: Company
  place: PlaceStored
}

type CompanyDemoSeed = {
  id: string
  name: string
  city: string
  region: string
  postalCode: string
}

const target = (seed: CompanyDemoSeed): CompanyDemoTarget => ({
  company: {
    ...CompanyModel,
    id: seed.id,
    created: { at: stamp },
    updated: { at: stamp },
  },
  place: {
    id: seed.id,
    name: seed.name,
    short_name: seed.name,
    place_type: 'physical',
    source: 'manual',
    formatted_address: `${seed.postalCode} ${seed.city}, Switzerland`,
    short_address: seed.city,
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
  },
})

export const companyDemoTargets: CompanyDemoTarget[] = [
  target({
    id: 'alpine-foodservice-hq',
    name: 'Alpine Foodservice',
    city: 'Interlaken',
    region: 'Bern',
    postalCode: '3800',
  }),
  target({
    id: 'pantry-house-hq',
    name: 'Pantry House',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3000',
  }),
  target({
    id: 'bern-market-garden-hq',
    name: 'Bern Market Garden',
    city: 'Bern',
    region: 'Bern',
    postalCode: '3013',
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
    !item.place.name ||
    item.place.place_type !== 'physical' ||
    item.place.source !== 'manual' ||
    Object.keys(item.company).sort().some(
      (key, index) => key !== companyKeys[index]
    ) ||
    Object.keys(item.company).length !== companyKeys.length
  ) {
    throw new Error(
      `Company Demo ${companyId || '(missing-id)'} requires one stamps-only Company and same-id sparse Place root.`
    )
  }
  companyIds.add(companyId)
}

export const companyDemoRecords = companyDemoTargets.map(
  (item) => item.company
)

export const companyDemoPlaces = companyDemoTargets.map(
  (item) => item.place
)
