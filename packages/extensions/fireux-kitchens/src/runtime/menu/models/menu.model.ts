import type { WeekdayTimeWindowsConfig } from '../../models/shared/weekday-time.model'
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
  /** Optional Workspace label; customers see name. */
  internal_name?: string
  /** Internal operator background; omitted from public projections. */
  context?: string
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
