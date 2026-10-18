import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Menu } from './menu.model'

export type * from './menu.model'

export const MenuStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/menus/{menuId}',
  collection: 'menus',
  scopeCollection: 'menus',
  parent: 'kitchen',
  idParam: 'menuId',
  children: {
    sections: 'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
    items:
      'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  },
} as const

export const MenuDefaults: Menu = {
  id: '',
  slug: '',
  name: '',
  description: '',
  status: 'draft',
  format: 'interactive',
  sort_order: 0,
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
}

export type MenuRecordCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<
  Pick<
    Menu,
    'name' | 'description' | 'sort_order' | 'doc' | 'audience' | 'serving_hours'
  >
>
