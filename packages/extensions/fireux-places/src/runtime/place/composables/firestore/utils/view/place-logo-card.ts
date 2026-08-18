import { PlaceStorage } from '../../../../models/place.model.ts'
import type { PlaceLogoTarget } from './place-logo.types.ts'
import type { PlaceCard } from './usePlaceInterface.ts'

export function toLogoCard(place: PlaceLogoTarget): PlaceCard.Card {
  const id = (place as any).id ?? (place as any).place_id ?? ''
  const name = (place as any).name ?? ''
  const shortName = (place as any).shortName ?? (place as any).short_name ?? ''
  const formattedAddress =
    (place as any).formattedAddress ?? (place as any).formatted_address ?? ''
  const shortAddress =
    (place as any).shortAddress ?? (place as any).short_address ?? ''
  const imageUrl =
    (place as any).imageUrl ??
    (place as any).image_url ??
    (place as any).place_image ??
    ''

  return {
    id,
    to: `/${PlaceStorage.collection}/${encodeURIComponent(id)}`,
    title: (place as any).title ?? name,
    subtitle: (place as any).subtitle ?? formattedAddress,
    badges: (place as any).badges ?? [],
    name,
    shortName,
    formattedAddress,
    shortAddress,
    imageUrl,
    source: (place as any).source,
  }
}
