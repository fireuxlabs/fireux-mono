import type { FireuxAppSubscriptionCapacity } from 'fireux-core/config/app/types'
import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'
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
      'kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{entryId}',
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
    by: '' as FireuxStamps['created']['by'],
    app_id: '' as FireuxStamps['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamps['updated']['by'],
  },
}

export type MenuRecordCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<
  Pick<
    Menu,
    | 'name'
    | 'internal_name'
    | 'description'
    | 'sort_order'
    | 'audience'
    | 'serving_hours'
    | 'theme_mode'
  >
>

// Menu records belong to a Kitchen; the actor's account subscription governs creation only.
export const kitchenMenuCapacity = {
  'kitchen.menus': { free: 1, pro: null, business: null },
} satisfies FireuxAppSubscriptionCapacity
