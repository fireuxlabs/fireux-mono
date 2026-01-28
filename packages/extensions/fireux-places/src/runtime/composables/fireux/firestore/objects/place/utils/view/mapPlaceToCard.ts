import type { BasePlace } from '../../../../../../../models/objects/place.model'
import { canonicalPlaceId } from '../../fetch/google/usePlacesGoogle'
import type { MapToCard } from '../../fetch/search/types'
import type { PlaceCard } from './usePlacesInterface'
import { usePlacesInterface } from './usePlacesInterface'

export const mapPlaceToCard = (): MapToCard => {
  const { card } = usePlacesInterface()
  return (p: any, collectionOverride?: string): PlaceCard.Card => {
    const id = canonicalPlaceId(p?.place_id ?? p?.id) ?? ''
    const sourceRaw = typeof p?.source === 'string' ? p.source : 'fireux'
    const source =
      sourceRaw === 'google' ? 'google' : sourceRaw === 'manual' ? 'manual' : 'fireux'

    const latRaw = Number(p?.lat)
    const lngRaw = Number(p?.lng)
    const lat = Number.isFinite(latRaw) ? latRaw : undefined
    const lng = Number.isFinite(lngRaw) ? lngRaw : undefined

    const base: BasePlace = {
      id,
      name: String(p?.name ?? ''),
      short_name:
        typeof p?.short_name === 'string' ? p.short_name : '',
      formatted_address:
        typeof p?.formatted_address === 'string' ? p.formatted_address : '',
      short_address:
        typeof p?.short_address === 'string' ? p.short_address : '',
      lat: 0,
      lng: 0,
      place_image:
        typeof (p?.place_image ?? p?.image_url) === 'string'
          ? (p?.place_image ?? p?.image_url)
          : '',
      claimed_by: typeof p?.claimed_by === 'string' ? p.claimed_by : '',
      image_shade:
        typeof p?.image_shade === 'string' ? p.image_shade : 'none',
      source: source as any,
    }

    const baseCard = card(base) as PlaceCard.Card

    return {
      ...baseCard,
      collection: collectionOverride ?? p?.collection ?? undefined,
      ...(typeof lat === 'number' ? { lat } : {}),
      ...(typeof lng === 'number' ? { lng } : {}),
    }
  }
}
