import type { Place } from 'fireux-places/runtime/place/models/place.model'
import type { MediaBackdropColor } from 'fireux-places/runtime/place/utils/place-spine'
import type { SproochliAttachmentConfig } from 'fireux-sproochli/runtime/sproochli'
import type { Kitchen } from '../models/model'
import type { KitchenPublicOffering } from '../utils/public-offerings'

/** Normalized public Kitchen and its required same-ID Place; no root metadata. */
export type KitchenPublicSummary = {
  id: Kitchen['id']
  identity: Kitchen['identity']
  services: { title: string; item_images?: true }
  place: Place
}

/** Facts guaranteed by the directory's server enrichment, not exact reads. */
export type KitchenDirectoryEntry = KitchenPublicSummary & {
  service_labels: string[]
  has_published_menu: boolean
  special?: {
    date: string
    today: boolean
    nextChangeAt: number
    slug: string
    currencyCode?: string
    items: Array<{
      id: string
      name: string
      description: string
      price: number
      imageUrl?: string
    }>
  }
}

export type KitchenDetailPresentation = {
  id: string
  name: string
  slug: string
  visible: boolean
  offerings: KitchenPublicOffering[]
  route_scope: 'live'
  display_name: string
  short_name?: string
  formatted_address?: string
  short_address?: string
  logo_image_url?: string
  image_url?: string
  image_kind?: 'photograph' | 'brand'
  media_backdrop_color?: MediaBackdropColor
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
  kitchen: KitchenPublicSummary
  place: Place
  presentation: KitchenDetailPresentation
}
