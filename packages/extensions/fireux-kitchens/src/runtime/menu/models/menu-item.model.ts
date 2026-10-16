import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type MenuItemStatus = 'active' | 'archived'
export type MenuItemReference =
  | { dish_id: string; promotion_id?: never }
  | { promotion_id: string; dish_id?: never }

export type MenuItem = FireuxStamped &
  MenuItemReference & {
    id: string
    kitchen_id: string
    menu_id: string
    section_id: string
    status: MenuItemStatus
    sort_order: number
  }
