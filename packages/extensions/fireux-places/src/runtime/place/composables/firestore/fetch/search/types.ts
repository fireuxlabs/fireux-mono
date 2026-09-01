import type { Place } from '../../../../models/place.model.ts'

export type BasePlace = Pick<
  Place,
  | 'id'
  | 'name'
  | 'short_name'
  | 'place_type'
  | 'formatted_address'
  | 'short_address'
  | 'lat'
  | 'lng'
  | 'image_url'
  | 'claimed_by'
  | 'slug'
  | 'entity_families'
> &
  Partial<
    Pick<Place, 'cover_image' | 'about' | 'tagline' | 'tags' | 'types'>
  > & {
    image_shade?: import('../../../../utils/place-spine').PlaceImageShade
    source?: PlaceSearchSource
  }

export type PlaceSearchSource = 'fireux' | 'google'

export type BasePlaceRecord = BasePlace & { collection?: string }

export type PlaceSearchLocation = {
  lat: number
  lng: number
  radiusMeters: number
}

export type SearchStage = {
  results: BasePlaceRecord[]
  stage: string
  debug?: Record<string, unknown>
}

export type MapToBasePlace = (
  p: any,
  collectionOverride?: string
) => BasePlaceRecord
