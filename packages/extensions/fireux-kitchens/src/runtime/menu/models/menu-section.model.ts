// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify sections under scoped KitchenMenu authority.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: App-scoped Kitchen Menu child record.
 *
 * MenuSection groups MenuItems for presentation. It is not a standalone food
 * entity and it is not root Menu truth.
 */
export const MenuSectionStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
  collection: 'sections',
  parent: 'menu',
  idParam: 'sectionId',
} as const

export const MenuSectionRecord = defineFireuxEntity({
  kind: 'record',
  name: 'MenuSection',
  family: 'menu',
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  parent: 'KitchenMenu',
  scoped: MenuSectionStorage.path,
  notes: [
    'MenuSection groups MenuItems for presentation.',
    'It is not standalone food truth and is deleted or copied with its Menu.',
  ],
})

export type MenuSectionStatus = 'active' | 'archived'

export const MenuSectionModel = {
  id: '' as string,
  kitchen_id: '' as string,
  menu_id: '' as string,
  label: '' as string,
  description: '' as string,
  status: 'active' as MenuSectionStatus,
  sort_order: 0 as number,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const

type MutableModel<T> = {
  -readonly [K in keyof T]: T[K]
}

export type MenuSection = MutableModel<typeof MenuSectionModel>

export type MenuSectionCreateInput = Omit<MenuSection, 'created' | 'updated'>
export type MenuSectionUpdateInput = Partial<
  Omit<MenuSection, 'id' | 'created' | 'updated' | 'kitchen_id' | 'menu_id'>
>
