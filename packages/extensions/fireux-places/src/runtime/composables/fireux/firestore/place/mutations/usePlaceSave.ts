import { collection, doc, limit as fslimit, query as fsq, getDoc, getDocs, where } from 'firebase/firestore'
import { useImageStorage } from 'fireux-core/runtime/composables/fireux/firebase/useImageStorage'
import { useFirestoreManager } from 'fireux-core/runtime/composables/fireux/firestore/operations/useFirestoreManager'
import { useSeoIndexWrite } from 'fireux-core/runtime/composables/fireux/firestore/seo/useSeoIndexWrite'
import type { PlaceUpsertInput } from 'fireux-places/runtime/models/place.model'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { canonicalPlaceId, fetchPlaceDetails } from '../fetch/google/usePlacesGoogle'
import { toShortAddress } from '../utils/view/formatPlaceAddress'
import { toPlaceSlug, toPlaceSlugWithSuffix } from '../utils/view/toPlaceSlug'
import { sanitizeLogoAvatar } from '../utils/view/usePlaceLogos'

export interface UsePlaceSaveOptions {
  type?: string | null | undefined
  types?: string[]
}

export function usePlaceSave(_options: UsePlaceSaveOptions = {}) {
  const { setDocument } = useFirestoreManager()
  const { upsertSeoIndexDoc } = useSeoIndexWrite()
  const { uploadFromUrl } = useImageStorage()
  const db = useFirestore()

  /** Ensure a place document exists in Firestore. */
  async function ensurePlaceExists(place: Partial<PlaceUpsertInput> & { id?: string }): Promise<boolean> {
    const id = canonicalPlaceId((place as any)?.id ?? (place as any)?.place_id)
    if (!id) return false

    const collectionPath = 'places'

    const ref = doc(db, collectionPath, id)
    const snapshot = await getDoc(ref)

    if (snapshot.exists()) {
      await upsertSeoIndexDoc('seo_index_places', id, {
        path: `/places/${id}`,
        isPublic: true,
      })
      if (import.meta.dev)
        console.log(`[fireux-places] Place already exists: ${id}`)
      return true
    }

    if (import.meta.dev) {
      console.log('[fireux-places] ensure:start', {
        id,
        incoming_place_image: (place as any)?.place_image ?? '',
        incoming_image_url: (place as any)?.image_url ?? '',
        incoming_source: (place as any)?.source ?? '',
      })
    }

    const latValueInitial = Number((place as any)?.lat)
    const lngValueInitial = Number((place as any)?.lng)
    const hasCoordsInitial = Number.isFinite(latValueInitial) && Number.isFinite(lngValueInitial)
    const isZeroCoordsInitial = hasCoordsInitial && latValueInitial === 0 && lngValueInitial === 0
    const shouldHydrate = !hasCoordsInitial || isZeroCoordsInitial

    if (shouldHydrate) {
      const details = await fetchPlaceDetails(id)
      if (details?.google) {
        place = {
          ...place,
          name: details.google.name,
          formatted_address: details.google.formatted_address,
          short_address: toShortAddress(details.google.formatted_address),
          lat: details.google.lat,
          lng: details.google.lng,
          image_url: (place as any)?.image_url ?? (place as any)?.place_image ?? details.google.image_url ?? '',
          source: (place as any)?.source ?? 'google',
        }
        if (import.meta.dev) {
          console.log('[fireux-places] ensure:hydrated', {
            id,
            hydrated_place_image: (place as any)?.image_url ?? (place as any)?.place_image ?? '',
            hydrated_source: (place as any)?.source ?? '',
          })
        }
      }
    }

    const name = typeof (place as any)?.name === 'string' ? String((place as any).name) : ''
    const shortName =
      typeof (place as any)?.short_name === 'string'
        ? String((place as any).short_name).trim()
        : ''
    const formatted =
      typeof (place as any)?.formatted_address === 'string'
        ? String((place as any).formatted_address)
        : ''
    const shortAddress = toShortAddress(
      typeof (place as any)?.short_address === 'string'
        ? String((place as any).short_address)
        : formatted
    )
    const placeImageRaw =
      (place as any)?.image_url ?? (place as any)?.place_image
    const remoteImageUrl = typeof placeImageRaw === 'string' ? placeImageRaw.trim() : ''
    if (import.meta.dev) {
      console.log('[fireux-places] ensure:image-raw', {
        id,
        placeImageRaw: placeImageRaw ?? '',
        remoteImageUrl,
      })
    }
    let image_url = sanitizeLogoAvatar(remoteImageUrl) ?? ''
    const latValue = Number((place as any)?.lat)
    const lngValue = Number((place as any)?.lng)
    const lat = Number.isFinite(latValue) ? latValue : 0
    const lng = Number.isFinite(lngValue) ? lngValue : 0
    if (!Number.isFinite(latValue) || !Number.isFinite(lngValue) || (lat === 0 && lng === 0)) {
      if (import.meta.dev) {
        console.warn('[fireux-places] Skipping place with missing coords', { id, lat, lng })
      }
      return false
    }
    if (import.meta.dev) {
      console.log('[fireux-places] image:pre-upload', {
        id,
        image_url,
        isFirebaseUrl: image_url.includes('firebasestorage.googleapis.com'),
      })
    }

    if (image_url && !image_url.includes('firebasestorage.googleapis.com')) {
      try {
        const uploaded = await uploadFromUrl(`places/${id}/image`, image_url)
        if (import.meta.dev) {
          console.log('[fireux-places] image:uploaded', {
            id,
            from: image_url,
            to: uploaded,
          })
        }
        image_url = uploaded
      } catch (e) {
        if (import.meta.dev) console.warn('[fireux-places] avatar upload failed', e)
        image_url = ''
      }
    }

    const search_term_raw = (place as any)?.search_term
    const search_term =
      typeof search_term_raw === 'string' && search_term_raw.trim().length
        ? search_term_raw.trim()
        : `${name} ${formatted}`.toLowerCase().trim()
    const normalized_search_term = search_term
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()

    const shadeRaw = typeof (place as any)?.image_shade === 'string'
      ? String((place as any).image_shade).toLowerCase().trim()
      : ''
    const image_shade =
      shadeRaw === 'light' || shadeRaw === 'dark' || shadeRaw === 'none'
        ? shadeRaw
        : 'none'

    // ── Collision-safe slug ─────────────────────────────────
    const baseSlug = toPlaceSlug(name, shortAddress)
    let slug = baseSlug
    if (slug) {
      const slugQ = fsq(
        collection(db, 'places'),
        where('slug', '==', slug),
        fslimit(1)
      )
      const slugSnap = await getDocs(slugQ)
      if (!slugSnap.empty) {
        slug = toPlaceSlugWithSuffix(baseSlug, id)
      }
    }

    const payload = {
      id,
      source: 'fireux',
      name,
      short_name: shortName,
      formatted_address: formatted,
      short_address: shortAddress,
      slug,
      image_url,
      image_shade,
      lat,
      lng,
      place_type: 'physical',
      search_term: normalized_search_term,
    } as any as PlaceUpsertInput

    if (import.meta.dev) {
      console.log('[fireux-places] save:payload', {
        id,
        image_url: payload.image_url ?? '',
        name: payload.name ?? '',
        formatted_address: payload.formatted_address ?? '',
      })
    }

    await setDocument(collectionPath, id, payload, { creator: true })
    await upsertSeoIndexDoc('seo_index_places', id, {
      path: `/places/${id}`,
      isPublic: true,
    })

    if (import.meta.dev) console.log(`[fireux-places] Created new place: ${id}`)

    return true
  }

  return { ensurePlaceExists }
}
