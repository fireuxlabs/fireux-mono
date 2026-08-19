import type { FireuxEntityManagement } from 'fireux-core/runtime/models/utils/scope.model'
import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { Kitchen, KitchenMediaBackdropColor } from './kitchen.model.ts'

export type KitchenDetailPresentation = {
  id: string
  name: string
  slug: string
  visible: boolean
  management_mode: FireuxEntityManagement['mode']
  management_app_id?: string
  route_scope: 'live'
  display_name: string
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  logo_image_url?: string
  image_url?: string
  image_kind?: 'photograph' | 'brand'
  media_backdrop_color?: KitchenMediaBackdropColor
  sproochli?: Pick<
    SproochliAttachmentConfig,
    'enabled' | 'default_language' | 'requested_languages'
  >
  tagline?: string
  display_image_url?: string
  place_image_url?: string
  cover_image?: string
  wordmark_image?: string
  food_gallery?: string[]
  about?: string
  phone?: string
  website?: string
  google_maps_url?: string
  currency_code?: string
  lat?: number
  lng?: number
}

export type KitchenDetailResponse = {
  kitchen: Kitchen
  place: Place
  presentation: KitchenDetailPresentation
}

export type KitchenIdentityEdit = {
  display_name: string
  tagline: string
  card_image_url: string
  logo_image_url: string
}

export type KitchenIdentityEditResponse = {
  ok: true
  kitchen_id: string
  identity: KitchenIdentityEdit
}
