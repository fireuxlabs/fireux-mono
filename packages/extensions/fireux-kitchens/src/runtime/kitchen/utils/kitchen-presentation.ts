import type {
  MediaBackdropColor,
  PlaceImageShade,
} from 'fireux-places/runtime/place/utils/place-spine'

type KitchenPresentationRecord = Record<string, unknown> | null | undefined

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

/** Reads an already joined Directory/Workspace presentation, never a Kitchen root. */
export function readKitchenPresentationIdentity(
  value: KitchenPresentationRecord
) {
  const source = record(value)
  const identity = record(source.identity)
  const imageShade = text(source.image_shade)

  return {
    displayName: text(identity.display_name || source.display_name || source.name),
    tagline: text(identity.tagline || source.tagline || source.brand_tagline),
    imageUrl: text(identity.image_url || source.display_image_url || source.image_url),
    cardImageUrl: text(identity.card_image_url),
    logoImageUrl: text(identity.logo_image_url || source.logo_image_url),
    wordmarkImageUrl: text(
      identity.wordmark_image_url || source.wordmark_image_url || source.wordmark_image
    ),
    mediaBackdropColor: text(
      identity.media_backdrop_color || source.media_backdrop_color
    ) as MediaBackdropColor | '',
    imageShade: (
      imageShade === 'light' || imageShade === 'dark' ? imageShade : 'none'
    ) as PlaceImageShade,
  }
}
