import type { Ecosystem } from '../../ecosystem/models/ecosystem.model.ts'

/**
 * Directory entries carry the fields needed to discover canonical entities.
 */
export type EcosystemDirectoryEntry = Pick<
  Ecosystem,
  'id' | 'project_id' | 'status' | 'name' | 'description' | 'image_url' | 'website_url'
> & {
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
