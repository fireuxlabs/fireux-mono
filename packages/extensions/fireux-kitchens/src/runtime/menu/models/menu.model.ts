import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type MenuStatus = 'draft' | 'published' | 'archived'

export type MenuDocument = {
  url: string
  name: string
  type: string
  storage_path: string
}

export type Menu = FireuxStamped & {
  id: string
  slug: string
  name: string
  description?: string
  status: MenuStatus
  sort_order: number
  schedule?: 'regular' | 'daily'
  /** Dates explicitly released for public browsing; content remains section-owned. */
  published_dates?: string[]
  audience?: 'public' | 'private_link' | 'protected_group'
  format: 'interactive' | 'document'
  doc?: MenuDocument
}
