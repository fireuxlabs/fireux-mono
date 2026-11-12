import type { Ecosystem } from './ecosystem.model'

/** Public discovery projection enriched with related App count and destination. */
export type EcosystemDirectoryEntry = Pick<
  Ecosystem,
  | 'id'
  | 'project_id'
  | 'status'
  | 'name'
  | 'description'
  | 'image_url'
  | 'website_url'
> & {
  detail_url: string
  app_count: number
}
