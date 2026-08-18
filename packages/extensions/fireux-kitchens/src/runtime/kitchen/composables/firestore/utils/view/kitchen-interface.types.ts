import type { Place, PlaceImageShade } from 'fireux-places/runtime/place/models/place.model'
import type { CurrencyDisplayFormat } from '../../../../../models/shared/currency-display.model.ts'
import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { PageStyle } from 'fireux-core/runtime/models/utils/style.model'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { Kitchen, KitchenMenusConfig } from '../../../../models/kitchen.model.ts'
import type { PublicKitchenImageKind } from '../../../../models/kitchen-index.model.ts'

export namespace KitchenCard {
  export type Card = {
    id: string
    to: string

    // Primary display fields
    title: string
    subtitle: string

    // Status/label chips
    badges: string[]

    name: string
    shortName: string
    formattedAddress: string
    shortAddress: string

    // Media (empty string means unset)
    imageUrl: string

    // Image tone metadata
    imageShade?: PlaceImageShade
    imageKind?: PublicKitchenImageKind

    // Search collection (optional)
    collection?: string

    // Ownership
    claimedBy?: string
  }

  export type Profile = Card & {
    card: Card
    tagline: string
    foodGallery: string[]
  }
}

export type KitchenSurface = {
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
  place_id?: string
  created?: unknown
  updated?: unknown
  name?: string
  display_name?: string
  tagline?: string
  short_name?: string
  food_gallery?: string[]
  currency_code?: string
  menu_currency_format?: CurrencyDisplayFormat
  menu_show_currency?: boolean
  menu_available?: boolean
  menus?: KitchenMenusConfig
  sproochli?: SproochliAttachmentConfig
  menu_style?: Partial<PageStyle>
  formatted_address?: string
  short_address?: string
  lat?: number
  lng?: number
  image_url?: string
  display_image_url?: string
  logo_image_url?: string
  image_shade?: PlaceImageShade
  image_kind?: PublicKitchenImageKind
  media_backdrop_color?: string
  claimed_by?: string
  brand_tagline?: string
  website?: string
  phone?: string
  social_links?: unknown
  cover_image?: string
  gallery_images?: string[]
  about?: string
  verified?: boolean
  operator_ids?: string[]
  team_ids?: string[]
}

export type KitchenSurfaceParts<TKitchen extends object = Partial<Kitchen>> = {
  kitchen?: TKitchen | null | undefined
  place?: Partial<Pick<
    Place,
    | 'name'
    | 'short_name'
    | 'brand_tagline'
    | 'about'
    | 'short_address'
    | 'formatted_address'
    | 'address'
    | 'lat'
    | 'lng'
    | 'timezone'
    | 'image_url'
    | 'cover_image'
    | 'gallery_images'
    | 'image_shade'
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
    | 'search_term'
  >> | null | undefined
  scope?: Record<string, unknown> | null | undefined
  routeScope?: KitchenSurface['route_scope']
}
