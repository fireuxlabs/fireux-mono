import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type MenuSectionStatus = 'active' | 'archived'
export type MenuSection = FireuxStamped & {
  id: string
  kitchen_id: string
  menu_id: string
  label: string
  description: string
  status: MenuSectionStatus
  sort_order: number
}
