import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { MenuStatus } from './menu.model'

export type KitchenMenuDocument = {
  url: string
  name: string
  type: string
  storage_path: string
}

export type KitchenMenu = FireuxStamped & {
  id: string
  slug: string
  name: string
  description?: string
  status: MenuStatus
  sort_order: number
  /** Absent on existing regular menus. */
  schedule?: 'regular' | 'daily'
  doc?: KitchenMenuDocument
}
