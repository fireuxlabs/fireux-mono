// Concurrent edit — 2026-07-21 14:11 CEST — Werkbox Firebase hardening: retire the untrusted client Place delete surface.
// Concurrent edit — 2026-07-22 12:58 CEST — Place detail deletion: export the trusted Place removal intent.
import type { Ref } from 'vue'
import { unref } from 'vue'
import { usePlaceSearch } from '../usePlaceSearch'
import { usePlaceCollection } from './fetch/usePlaceCollection'
import { usePlaceFetch } from './fetch/usePlaceFetch'
import { usePlaceClaim } from './mutations/usePlaceClaim'
import { usePlaceCreate } from './mutations/usePlaceCreate'
import { usePlaceDelete } from './mutations/usePlaceDelete'
import { usePlaceUpdate } from './mutations/usePlaceUpdate'
import { usePlaceSeo } from '../usePlaceSeo'
import { usePlaceComputed } from './utils/view/usePlaceComputed'
import {
  formatPlaceTypeLabel,
  usePlaceInterface,
} from './utils/view/usePlaceInterface'

export {
  usePlaceCollection,
  usePlaceFetch,
  usePlaceSearch,
  usePlaceClaim,
  usePlaceCreate,
  usePlaceDelete,
  usePlaceUpdate,
  usePlaceSeo,
  usePlaceComputed,
  formatPlaceTypeLabel,
  usePlaceInterface,
}

export interface UsePlaceOptions {
  keyword?: string | null | undefined | Ref<string | null | undefined>
  type?: string | null | undefined | Ref<string | null | undefined>
  types?: string[]
}

/**
 * FireUX stack family: Normal root entity.
 * Entity: Place.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * - packages/extensions/fireux-places/docs/contract.md
 *
 * This file is the single Place family entry seam.
 * Search is a Place read/search seam; create and update stay explicit
 * instead of being hidden behind `save`.
 */
export function usePlace(options: UsePlaceOptions = {}) {
  return {
    ...usePlaceCollection(),
    ...usePlaceFetch(),
    ...usePlaceSearch(),
    ...usePlaceCreate({ type: unref(options.type), types: options.types }),
    ...usePlaceDelete(),
    ...usePlaceUpdate(),
    ...usePlaceClaim(),
    ...usePlaceComputed(),
    ...usePlaceInterface(),
    usePlaceSeo,
  }
}
