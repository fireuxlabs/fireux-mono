import type { BasePlace } from '../../../../../../../models/objects/place.model'
import { canonicalPlaceId } from '../../fetch/google/usePlacesGoogle'
import type { BasePlaceRecord, MapToBasePlace } from '../../fetch/search/types'

export const mapPlaceToBasePlace = (): MapToBasePlace => {
  return (p: any, collectionOverride?: string): BasePlaceRecord => {
    const id = canonicalPlaceId(p?.place_id ?? p?.id) ?? ''
    const sourceRaw = typeof p?.source === 'string' ? p.source : 'fireux'
    const source =
      sourceRaw === 'google'
        ? 'google'
        : sourceRaw === 'manual'
          ? 'manual'
          : 'fireux'

    const latRaw = Number(p?.lat)
    const lngRaw = Number(p?.lng)

    const base: BasePlace = {
      id,
      name: String(p?.name ?? ''),
      short_name: typeof p?.short_name === 'string' ? p.short_name : '',
      formatted_address:
        typeof p?.formatted_address === 'string' ? p.formatted_address : '',
      short_address:
        typeof p?.short_address === 'string' ? p.short_address : '',
      lat: Number.isFinite(latRaw) ? latRaw : 0,
      lng: Number.isFinite(lngRaw) ? lngRaw : 0,
      image_url:
        typeof (p?.image_url ?? p?.place_image) === 'string'
          ? (p?.image_url ?? p?.place_image)
          : '',
      claimed_by: typeof p?.claimed_by === 'string' ? p.claimed_by : '',
      image_shade: typeof p?.image_shade === 'string' ? p.image_shade : 'none',
      source: source as any,
    }

    return {
      ...base,
      collection: collectionOverride ?? p?.collection ?? undefined,
    }
  }
}