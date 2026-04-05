// Local demo payloads for Kitchens (git-ignored).
// These files are for dev-only UI prototyping and are not part of the repo.

// FILE: demo/kitchen.demo.ts

import type { Kitchen, KitchenCollection } from 'fireux-kitchens/runtime/models/kitchen.model'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { demoPlaceDocDataList } from './place.demo'

export const demoKitchen: KitchenCollection = {
  id: 'dev-place-harbor-001',
  created_at: {} as any,
  updated_at: {} as any,
}

export const demoKitchenCollectionList: KitchenCollection[] = [
  demoKitchen,
  {
    id: 'dev-place-harbor-002',
    created_at: {} as any,
    updated_at: {} as any,
  },
  {
    id: 'dev-place-harbor-003',
    created_at: {} as any,
    updated_at: {} as any,
  },
  {
    id: 'dev-place-harbor-004',
    created_at: {} as any,
    updated_at: {} as any,
  },
  {
    id: 'dev-place-harbor-005',
    created_at: {} as any,
    updated_at: {} as any,
  },
  {
    id: 'dev-place-harbor-006',
    created_at: {} as any,
    updated_at: {} as any,
  },
  {
    id: 'dev-place-harbor-007',
    created_at: {} as any,
    updated_at: {} as any,
  },
]

/**
 * Private hydration helper (no external function file).
 * Merge the kitchen record with the subset of Place fields we expose on Kitchen.
 */
function hydrateKitchenFromPlace(kitchen: KitchenCollection, place: Partial<Place>): Kitchen {
  return {
    ...kitchen,

    // Place props we hydrate onto Kitchen (read-time only)
    name: typeof place.name === 'string' ? place.name : '',
    short_name: typeof place.short_name === 'string' ? place.short_name : '',
    short_address: typeof place.short_address === 'string' ? place.short_address : '',
    formatted_address: typeof place.formatted_address === 'string' ? place.formatted_address : '',
    lat: typeof place.lat === 'number' ? place.lat : 0,
    lng: typeof place.lng === 'number' ? place.lng : 0,
    image_url: typeof place.image_url === 'string' ? place.image_url : '',
    image_shade: (place as any)?.image_shade ?? 'none',
    claimed_by: typeof (place as any)?.claimed_by === 'string' ? (place as any).claimed_by : '',
    source: ((place as any)?.source ?? 'demo') as any,
  }
}

const placeById = new Map<string, Partial<Place>>(
  (demoPlaceDocDataList as Partial<Place>[]).map((place) => [
    String((place as any)?.id ?? ''),
    place,
  ])
)

export const demoKitchenHydratedList: Kitchen[] = demoKitchenCollectionList.map((kitchen) => {
  const place = placeById.get(String(kitchen.id))
  return place ? hydrateKitchenFromPlace(kitchen, place) : kitchen
})

export const demoKitchenHydrated: Kitchen = demoKitchenHydratedList[0] ?? demoKitchen