import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { KitchenDetailPresentation } from '../models/kitchen-detail.response.ts'
import type { Kitchen } from '../models/kitchen.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

export function resolveKitchenDetailPresentation(
  base: KitchenDetailPresentation,
  kitchen: Kitchen,
  place: Place
): KitchenDetailPresentation {
  const name = place.name
  const tagline = text(place.tagline)
  const image = text(place.image_url)
  const logo = text(place.logo_image)
  const backdrop = place.media_backdrop_color

  return {
    ...base,
    id: kitchen.id,
    slug: kitchen.slug,
    visible: kitchen.visibility,
    name,
    display_name: name,
    ...(text(place.short_name) ? { short_name: text(place.short_name) } : {}),
    ...(tagline ? { tagline } : {}),
    ...(text(place.formatted_address)
      ? { formatted_address: text(place.formatted_address) }
      : {}),
    ...(text(place.short_address)
      ? { short_address: text(place.short_address) }
      : {}),
    ...(logo ? { logo_image_url: logo } : {}),
    ...(image ? { image_url: image, display_image_url: image } : {}),
    ...(backdrop ? { media_backdrop_color: backdrop } : {}),
    ...(text(place.cover_image)
      ? { cover_image: text(place.cover_image) }
      : {}),
    ...(text(place.wordmark_image)
      ? { wordmark_image: text(place.wordmark_image) }
      : {}),
    ...(place.gallery_images.length
      ? { food_gallery: place.gallery_images }
      : {}),
    ...(text(place.about) ? { about: text(place.about) } : {}),
    ...(text(place.phone) ? { phone: text(place.phone) } : {}),
    ...(text(place.website) ? { website: text(place.website) } : {}),
    ...(text(place.google_maps_url)
      ? { google_maps_url: text(place.google_maps_url) }
      : {}),
    ...(Number.isFinite(place.lat) ? { lat: place.lat } : {}),
    ...(Number.isFinite(place.lng) ? { lng: place.lng } : {}),
  }
}
