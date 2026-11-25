import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

export type MenuSectionStatus = 'active' | 'archived'
export type MenuSection = FireuxStamps & {
  id: string
  kitchen_id: string
  menu_id: string
  label: string
  description: string
  status: MenuSectionStatus
  sort_order: number
  /** Kitchen-local calendar date for a daily menu selection. */
  date?: string
}

export const MenuSectionStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
  collection: 'sections',
  parent: 'menu',
  idParam: 'sectionId',
} as const
export const MenuSectionDefaults: MenuSection = {
  id: '',
  kitchen_id: '',
  menu_id: '',
  label: '',
  description: '',
  status: 'active',
  sort_order: 0,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamps['created']['by'],
    app_id: '' as FireuxStamps['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamps['updated']['by'],
  },
}
export type MenuSectionCreateInput = Omit<MenuSection, 'created' | 'updated'>
export type MenuSectionUpdateInput = Partial<
  Omit<MenuSection, 'id' | 'created' | 'updated' | 'kitchen_id' | 'menu_id'>
>
