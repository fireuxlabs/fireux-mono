import type { EcosystemStatus } from '../../ecosystem/models/ecosystem.model.ts'

/**
 * Directory entries are transport records, not stored entities. They contain
 * only the fields needed to discover canonical App/Ecosystem records.
 */
export type EcosystemDirectoryEntry = {
  id: string
  project_id: string
  status: EcosystemStatus
  name: string
  description: string
  image_url: string
  website_url: string
  detail_url: string
  app_count: number
}

export type PlatformDirectoryResponse = {
  ok: true
  generatedAt: string
  ecosystems: EcosystemDirectoryEntry[]
}

export type CollectionResponse<T> = {
  ok: true
  count: number
  generatedAt: string
  items: T[]
}

export type DetailResponse<T> = {
  ok: true
  generatedAt: string
  item: T
}

/** A page of records; transport metadata does not create another Entity model. */
export type CollectionPage<T> = {
  ok: true
  items: T[]
  nextCursor: string | null
}
