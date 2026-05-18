import type { Ref } from 'vue'
import { unref } from 'vue'
import { usePlacesSearch } from './fetch/search/usePlacesSearch'
import { usePlacesCollection } from './fetch/usePlacesCollection'
import { usePlacesFetch } from './fetch/usePlacesFetch'
import { usePlaceClaim } from './mutations/usePlaceClaim'
import { usePlaceCreate } from './mutations/usePlaceCreate'
import { usePlaceUpdate } from './mutations/usePlaceUpdate'
import { usePlacesInterface } from './utils/view/usePlacesInterface'

export {
  usePlacesCollection as usePlaceCollection,
  usePlacesFetch as usePlaceFetch,
  usePlacesSearch as usePlaceSearch,
  usePlaceClaim,
  usePlaceCreate,
  usePlaceUpdate,
  usePlacesInterface as usePlaceInterface,
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
    ...usePlacesCollection(),
    ...usePlacesFetch(),
    ...usePlacesSearch(),
    ...usePlaceCreate({ type: unref(options.type), types: options.types }),
    ...usePlaceUpdate(),
    ...usePlaceClaim(),
    ...usePlacesInterface(),
  }
}
