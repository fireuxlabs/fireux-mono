// Package-owned demo payloads for Kitchens.
// Use these records for dev surfaces, examples, and explicit preflight demos.
// They are not canonical storage or runtime contracts.
// Concurrent edit — 2026-07-20 11:44 CEST — Root Efficiency Pass 4 of 4: move Kitchen fixtures to their domain owner.

import { demoPlaceDocDataList } from 'fireux-places/runtime/demo/place'
import type { Place } from 'fireux-places/runtime/models/place.model'
import { KitchenModel, type Kitchen } from '../models/kitchen.model'

type KitchenCollection = Pick<Kitchen, 'id'> & {
  created_at?: Record<string, unknown>
  updated_at?: Record<string, unknown>
}

type DemoKitchenSurface = Kitchen & {
  name: string
  short_name: string
  short_address: string
  formatted_address: string
  lat: number
  lng: number
  image_url: string
  image_shade: Place['image_shade']
  claimed_by: string
  source: Place['source']
}

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
function hydrateKitchenFromPlace(
  kitchen: KitchenCollection,
  place: Partial<Place>
): DemoKitchenSurface {
  return {
    ...KitchenModel,
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
    source: ((place as any)?.source ?? 'manual') as Place['source'],
  }
}

const placeById = new Map<string, Partial<Place>>(
  (demoPlaceDocDataList as Partial<Place>[]).map((place) => [
    String((place as any)?.id ?? ''),
    place,
  ])
)

export const demoKitchenHydratedList: DemoKitchenSurface[] = demoKitchenCollectionList.map((kitchen) => {
  const place = placeById.get(String(kitchen.id))
  return hydrateKitchenFromPlace(kitchen, place ?? {})
})

export const demoKitchenHydrated: DemoKitchenSurface =
  demoKitchenHydratedList[0] ?? hydrateKitchenFromPlace(demoKitchen, {})
