import type { Place } from '../models/place.model'

export type PlaceIdentityMedia = {
  imageUrl: string
  imageFit: 'contain' | 'cover'
  imageBackground?: string
}

/** Identity artwork uses its saved backdrop; profile photos keep their photo role. */
export function placeIdentityMedia(
  place?:
    | (Pick<Partial<Place>, 'logo_image' | 'image_url'> & {
        media_backdrop_color?: string
      })
    | null
): PlaceIdentityMedia {
  const logo = String(place?.logo_image || '').trim()
  if (!logo)
    return {
      imageUrl: String(place?.image_url || '').trim(),
      imageFit: 'cover',
    }
  const background = String(place?.media_backdrop_color || '').trim()
  return {
    imageUrl: logo,
    imageFit: 'contain',
    ...(background ? { imageBackground: background } : {}),
  }
}
