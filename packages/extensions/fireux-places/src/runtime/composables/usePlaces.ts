import { useFirestoreManager } from '#imports'
import type { Ref } from 'vue'
import type { GooglePlace, Place, PlaceCard } from '../models/place.model'
import { toStoredPlace } from '../models/place.model'
import { usePlacesSearch, type UsePlacesSearchResult } from './usePlacesSearch'

export interface UsePlacesResult extends UsePlacesSearchResult {
  collection: Ref<Place[] | undefined>
  place: (id: string) => Ref<Place | undefined>
  searchPlaces: (query: string) => Promise<PlaceCard.Cell[]>
  getPlaceDetails: (
    placeId: string
  ) => Promise<{ place: Place; raw: Record<string, any> } | null>
  savePlace: (place: Place) => Promise<void>
}

export function usePlaces(): UsePlacesResult {
  const { firestoreFetchCollection, firestoreFetchDoc, setDocument } =
    useFirestoreManager()

  const collection = firestoreFetchCollection<Place>('places')
  const place = (id: string) => firestoreFetchDoc<Place>('places', id)

  const canonicalPlaceId = (id?: string | null) =>
    (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

  function mapDetailsToGooglePlace(
    id: string,
    result: Record<string, any>
  ): GooglePlace {
    const location = result?.geometry?.location ?? {}
    const photos = Array.isArray(result?.photos) ? result.photos : []
    const primaryPhoto = photos.find(
      (photo: any) => typeof photo?.photo_reference === 'string'
    )

    let phone: string | null = null
    if (typeof result?.international_phone_number === 'string') {
      phone = result.international_phone_number
    } else if (typeof result?.formatted_phone_number === 'string') {
      phone = result.formatted_phone_number
    }

    return {
      place_id: id,
      name: result?.name ?? 'Unknown place',
      formatted_address:
        result?.formatted_address ?? result?.vicinity ?? 'Unknown address',
      lat: Number(location?.lat ?? 0),
      lng: Number(location?.lng ?? 0),
      source: 'google',
      photo_reference:
        typeof primaryPhoto?.photo_reference === 'string'
          ? primaryPhoto.photo_reference
          : null,
      photo_url: typeof result?.icon === 'string' ? result.icon : null,
      website: typeof result?.website === 'string' ? result.website : null,
      phone,
      rating: typeof result?.rating === 'number' ? result.rating : null,
      user_ratings_total:
        typeof result?.user_ratings_total === 'number'
          ? result.user_ratings_total
          : null,
    }
  }

  async function getPlaceDetails(placeId: string) {
    const id = canonicalPlaceId(placeId)
    if (!id) return null

    if (typeof window === 'undefined') {
      return null
    }

    const url = new URL('/api/places/details', window.location.origin)
    url.searchParams.set('place_id', id)

    const res = await fetch(url.toString(), {
      headers: { accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      return null
    }

    const { result } = (await res.json()) as {
      result: Record<string, any> | null
    }

    if (!result) return null

    const googlePlace = mapDetailsToGooglePlace(id, result)
    // eslint-disable-next-line no-console
    console.log('storing place')
    const place = toStoredPlace(googlePlace)

    return { place, raw: result }
  }

  async function savePlace(place: Place) {
    const id = canonicalPlaceId(place.place_id)
    if (!id) {
      throw new Error('Cannot save place without a valid place_id')
    }

    const payload: Record<string, any> = {
      ...place,
      place_id: id,
      source: 'firestore',
    }

    delete payload.created_at
    delete payload.updated_at

    await setDocument('places', id, payload)
  }

  return {
    collection,
    place,
    getPlaceDetails,
    savePlace,
    ...usePlacesSearch(),
  }
}
