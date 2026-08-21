import type { Property } from './property.model.ts'

export const PROPERTY_DIRECTORY_PAGE_SIZE = 24
export const PROPERTY_DIRECTORY_MAX_PAGE_SIZE = 48

export type PropertyDirectoryEntry = {
  id: string
  slug: string
  name: string
  image_url?: string
  property_type: Property['identity']['property_type']
  unit_count: number
}

export type PropertyDirectoryPage = {
  items: PropertyDirectoryEntry[]
  nextCursor?: string
}
