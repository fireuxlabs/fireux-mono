import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type {
  MediaBackdropColor,
  PlaceImageShade,
} from 'fireux-places/runtime/place/utils/place-spine'
import type { Kitchen } from '../models/kitchen.model'
import type { KitchenCollectionCard } from '../utils/kitchen-interface-projection'
import type { KitchenDirectoryEntry } from './public'

export type KitchenIdentityPresentation = {
  display_name: string
  tagline: string
  image_url: string
  media_backdrop_color?: MediaBackdropColor
}

/** Supplied Kitchen/Place presentation, never a raw document or access grant. */
export type KitchenSurface = Partial<Kitchen> &
  Partial<
    Pick<
      Place,
      | 'name'
      | 'short_name'
      | 'about'
      | 'formatted_address'
      | 'short_address'
      | 'address'
      | 'lat'
      | 'lng'
      | 'timezone'
      | 'image_url'
      | 'cover_image'
      | 'gallery_images'
      | 'logo_image'
      | 'wordmark_image'
      | 'media_backdrop_color'
      | 'phone'
      | 'email'
      | 'website'
      | 'google_maps_url'
      | 'social_links'
      | 'types'
      | 'tags'
      | 'price_level'
      | 'claimed_by'
      | 'verified'
    >
  > & {
    id: string
    identity: Kitchen['identity']
    slug: string
    status: Kitchen['identity']['status']
    visibility: boolean
    presentation: KitchenIdentityPresentation
    display_name: string
    tagline: string
    display_image_url: string
    food_gallery: string[]
    currency_code?: string
    can_write?: boolean
    service_labels?: string[]
    has_published_menu?: boolean
    special?: KitchenDirectoryEntry['special']
    operator_ids?: string[]
    team_ids?: string[]
    route_scope?: 'live' | 'demo' | 'test'
    image_shade?: PlaceImageShade
    image_kind?: 'photograph' | 'brand'
    logo_image_url?: string
  }

export type KitchenCard = KitchenCollectionCard & {
  id: string
  title: string
  subtitle: string
  shortName: string
  formattedAddress: string
  about: string
  priceLevel: string
  imageUrl: string
  logoImageUrl: string
  mediaBackdropColor?: string
  imageShade?: PlaceImageShade
  imageKind: 'photograph' | 'brand'
  claimedBy: string
}
