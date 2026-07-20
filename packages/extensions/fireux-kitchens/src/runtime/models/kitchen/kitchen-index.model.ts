// Concurrent edit — 2026-07-20 22:10 CEST — Place-root authority pass: define the sparse bounded published Kitchen index projection.
import type { KitchenImageShade } from '../kitchen.model'

export const PUBLIC_KITCHEN_INDEX_PAGE_SIZE = 24
export const PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE = 48

export type PublicKitchenIndexItem = {
  id: string
  name: string
  slug: string
  short_name?: string
  brand_tagline?: string
  formatted_address?: string
  short_address?: string
  image_url?: string
  image_shade?: KitchenImageShade
}

export type PublicKitchenIndexPage = {
  items: PublicKitchenIndexItem[]
  nextCursor?: string
}
