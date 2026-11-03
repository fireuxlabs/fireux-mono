import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
import type { FireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'

export type MenuStatus = 'draft' | 'published' | 'archived'

export type MenuDocument = {
  url: string
  name: string
  type: string
  storage_path: string
}

export type Menu = FireuxEntity & {
  slug: string
  name: string
  /** Optional Workspace label; customers see name. */
  internal_name?: string
  description?: string
  status: MenuStatus
  sort_order: number
  /** No override means available throughout each linked service. */
  serving_hours?: WeekdayTimeWindowsConfig | null
  schedule?: 'regular' | 'daily'
  /** Dates explicitly released for public browsing; content remains section-owned. */
  published_dates?: string[]
  audience?: 'public' | 'private_link' | 'protected_group'
  format: 'interactive' | 'document'
  doc?: MenuDocument
}
