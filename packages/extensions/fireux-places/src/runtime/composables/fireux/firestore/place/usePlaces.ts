import { usePlace, type UsePlaceOptions } from './usePlace'

export type UsePlacesOptions = UsePlaceOptions

/**
 * @deprecated Use `usePlace()` as the singular Place family entry seam.
 * `usePlaces()` remains only as a compatibility alias for old callers.
 */
export function usePlaces(options: UsePlacesOptions = {}) {
  return usePlace(options)
}
