import {
  usePlaceSave,
  type UsePlaceSaveOptions,
} from './usePlaceSave'

export type UsePlaceCreateOptions = UsePlaceSaveOptions

/**
 * Canonical Place creation seam.
 *
 * Internally this still uses the legacy ensure/upsert implementation until the
 * create-vs-ensure split is patched, but callers should use this explicit seam
 * instead of `usePlaceSave`.
 */
export function usePlaceCreate(options: UsePlaceCreateOptions = {}) {
  const { ensurePlaceExists } = usePlaceSave(options)

  return {
    ensurePlaceExists,
    createPlace: ensurePlaceExists,
  }
}
