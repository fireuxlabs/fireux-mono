import type { MediaBackdropColor } from 'fireux-places/runtime/place/models/place.model'

export const KITCHEN_DIRECTORY_PAGE_SIZE = 24
export const KITCHEN_DIRECTORY_MAX_PAGE_SIZE = 48

export type KitchenDirectoryImageKind = 'photograph' | 'brand'

export type KitchenDirectoryEntry = {
  id: string
  name: string
  slug: string
  visible: boolean
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  logo_image_url?: string
  image_url?: string
  image_kind?: KitchenDirectoryImageKind
  media_backdrop_color?: MediaBackdropColor
}

export type KitchenDirectoryPage = {
  items: KitchenDirectoryEntry[]
  nextCursor?: string
}
