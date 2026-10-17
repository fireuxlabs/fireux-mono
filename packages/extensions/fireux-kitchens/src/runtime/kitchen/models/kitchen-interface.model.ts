import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type {
  MediaBackdropColor,
  PlaceImageShade,
} from 'fireux-places/runtime/place/utils/place-spine'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { Kitchen } from './kitchen.model.ts'
import type { KitchenFulfilmentMode } from './fulfilment.model.ts'

/** Resolved identity shared by Kitchen presentation and authenticated responses. */
export type KitchenIdentityPresentation = {
  display_name: string
  tagline: string
  image_url: string
  media_backdrop_color?: MediaBackdropColor
  wordmark_image_url?: string
  gallery?: string[]
}

export namespace KitchenCard {
  export type Card = {
    id: string
    to: string

    // Primary display fields
    title: string
    subtitle: string

    // Status/label chips
    hasPublishedMenu?: boolean
    serviceLabels?: string[]
    badges: string[]

    name: string
    shortName: string
    formattedAddress: string
    shortAddress: string
    tagline: string
    about: string
    priceLevel: string
    fulfilmentModes: KitchenFulfilmentMode[]
    estimatedMinutes?: { min: number; max: number }

    // Media (empty string means unset)
    imageUrl: string
    discoveryImageUrl?: string
    logoImageUrl: string
    mediaBackdropColor?: string
    categoryLabels: string[]

    // Image tone metadata
    imageShade?: PlaceImageShade
    imageKind?: 'photograph' | 'brand'

    // Search collection (optional)
    collection?: string

    // Ownership
    claimedBy?: string
  }

  export type Profile = Card & {
    card: Card
    foodGallery: string[]
  }
}

export type KitchenSurface = {
  has_published_menu?: boolean
  service_labels?: string[]
  status?: Kitchen['identity']['status']
  // View surface only: Place-like fields are a resolved read projection of the
  // linked Place plus meaningful Kitchen/scoped deltas, never Kitchen authority.
  id?: string
  can_write?: boolean
  management?: FireuxEntityManagement
  management_app_id?: string
  slug?: string
  visibility?: boolean
  visible?: boolean
  route_scope?: 'live' | 'demo' | 'test'
  identity?: Kitchen['identity']
  presentation?: KitchenIdentityPresentation
  created?: unknown
  updated?: unknown
  name?: string
  display_name?: string
  tagline?: string
  short_name?: string
  food_gallery?: string[]
  currency_code?: string
  fulfilment?: {
    modes?: KitchenFulfilmentMode[]
    estimated_minutes?: { min: number; max: number }
  }
  formatted_address?: string
  short_address?: string
  lat?: number
  lng?: number
  image_url?: string
  display_image_url?: string
  logo_image_url?: string
  logo_image?: string
  image_shade?: PlaceImageShade
  image_kind?: 'photograph' | 'brand'
  media_backdrop_color?: string
  claimed_by?: string
  price_level?: string
  website?: string
  phone?: string
  social_links?: unknown
  cover_image?: string
  gallery_images?: string[]
  about?: string
  types?: string[]
  tags?: string[]
  verified?: boolean
  operator_ids?: string[]
  team_ids?: string[]
}

export type KitchenSurfaceParts<TKitchen extends object = Partial<Kitchen>> = {
  kitchen?: TKitchen | null | undefined
  place?:
    | (Partial<
        Pick<
          Place,
          | 'name'
          | 'short_name'
          | 'tagline'
          | 'about'
          | 'short_address'
          | 'formatted_address'
          | 'address'
          | 'lat'
          | 'lng'
          | 'timezone'
          | 'image_url'
          | 'logo_image'
          | 'cover_image'
          | 'gallery_images'
          | 'phone'
          | 'email'
          | 'website'
          | 'google_maps_url'
          | 'social_links'
          | 'place_type'
          | 'types'
          | 'tags'
          | 'price_level'
          | 'default_currency_code'
          | 'business_hours'
          | 'claimed_by'
          | 'verified'
          | 'slug'
        >
      > & { image_shade?: PlaceImageShade })
    | null
    | undefined
  scope?: Record<string, unknown> | null | undefined
  routeScope?: KitchenSurface['route_scope']
}
