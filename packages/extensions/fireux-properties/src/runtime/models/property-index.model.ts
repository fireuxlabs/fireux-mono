// Concurrent edit — 2026-07-20 22:39 CEST — Property public projection: define the bounded allowlisted Property index DTO.
import type { Property } from './property.model'

export const PUBLIC_PROPERTY_INDEX_PAGE_SIZE = 24
export const PUBLIC_PROPERTY_INDEX_MAX_PAGE_SIZE = 48

export type PublicPropertyIndexItem = {
  id: string
  slug: string
  name: string
  image_url?: string
  property_type: Property['identity']['property_type']
  unit_count: number
}

export type PublicPropertyIndexPage = {
  items: PublicPropertyIndexItem[]
  nextCursor?: string
}
