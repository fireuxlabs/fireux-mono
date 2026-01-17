import { doc, getDoc } from 'firebase/firestore'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useFirestore } from 'vuefire'
import type { PlaceUpsertInput } from '../../../../../../models/place.model'
import { canonicalPlaceId } from '../fetch/google/usePlacesGoogle'
import { toPlaceCollectionPath, usePlaceTypesConfig } from '../utils/placeCollections'

export interface UsePlaceSaveOptions {
  type?: string | null | undefined
  types?: string[]
}

export function usePlaceSave(options: UsePlaceSaveOptions = {}) {
  const { setDocument } = useFirestoreManager()
  const db = useFirestore()
  const configuredTypes = usePlaceTypesConfig()

  /** Ensure a place document exists in Firestore. */
  async function ensurePlaceExists(place: Partial<PlaceUpsertInput> & { id?: string }): Promise<boolean> {
    const id = canonicalPlaceId((place as any)?.id ?? (place as any)?.place_id)
    if (!id) return false

    const types = options.types ?? configuredTypes
    const collectionPath = toPlaceCollectionPath(options.type, types)

    const ref = doc(db, collectionPath, id)
    const snapshot = await getDoc(ref)

    if (snapshot.exists()) {
      if (import.meta.dev)
        console.log(`[fireux-places] Place already exists: ${id}`)
      return true
    }

    const name = typeof (place as any)?.name === 'string' ? String((place as any).name) : ''
    const formatted =
      typeof (place as any)?.formatted_address === 'string'
        ? String((place as any).formatted_address)
        : ''
    const placeImageRaw =
      (place as any)?.place_image ?? (place as any)?.image_url
    const place_image = typeof placeImageRaw === 'string' ? placeImageRaw : ''
    const lat = Number.isFinite(Number((place as any)?.lat)) ? Number((place as any).lat) : 0
    const lng = Number.isFinite(Number((place as any)?.lng)) ? Number((place as any).lng) : 0
    const search_term_raw = (place as any)?.search_term
    const search_term =
      typeof search_term_raw === 'string' && search_term_raw.trim().length
        ? search_term_raw.trim()
        : `${name} ${formatted}`.toLowerCase().trim()

    const payload = {
      id,
      source: 'fireux',
      name,
      formatted_address: formatted,
      place_image,
      lat,
      lng,
      search_term,
    } as any as PlaceUpsertInput

    await setDocument(collectionPath, id, payload)

    if (import.meta.dev) console.log(`[fireux-places] Created new place: ${id}`)

    return true
  }

  return { ensurePlaceExists }
}

