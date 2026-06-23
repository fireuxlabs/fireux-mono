import { defineFireuxEntity } from 'fireux-core/runtime/models/core/entity.model.ts'
import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { KitchenOrderType } from '../order.model'

/**
 * Family: App-scoped Kitchen presentation records.
 *
 * Menu is managed under the app-scoped Kitchen record. A Kitchen can start in
 * the Misebox app and later move into its own app, but Menu storage remains
 * app-scoped either way. Public menu routes render published Kitchen Menu
 * records; they do not create root Menu truth.
 *
 * Dish describes food. Menu presents selected dishes. MenuSection and MenuItem
 * live in their own child model files.
 *
 * Use `main` for a Kitchen's primary/default menu id. `default` is reserved
 * for language/settings vocabulary, not menu document names. User-facing menu
 * names such as "Comida Casera" live in `name`, not in the document id.
 *
 * Canon paths:
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}
 */
export const MenuStorage = {
  shape: 'scoped',
  scoped: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}',
  collection: 'menus',
  parent: 'kitchen',
  idParam: 'menuId',
  children: {
    sections: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
    items: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  },
} as const

export const MenuEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Menu',
  family: ['menu', 'kitchen'],
  storage: 'to-confirm',
  status: 'to-confirm',
  scoped: MenuStorage.path,
  notes: [
    'Kitchen Menu is scoped to a Kitchen.',
    'Root /menus records currently act as public doorway/upload records.',
    'Confirm whether Menu becomes both, or whether public doorway remains a separate record shape.',
  ],
})

export type MenuStatus = 'draft' | 'published' | 'archived'
export type MenuView = 'browse' | 'order'

export type MenuDocument = {
  url: string
  name: string
  type: string
  storage_path: string
}

export const MenuModel = {
  id: '' as string,
  kitchen_id: '' as string,
  name: '' as string,
  description: '' as string,
  status: 'draft' as MenuStatus,
  /**
   * Future note: Menu availability is distinct from Kitchen opening hours and
   * Place business hours. Add an explicit schedule field only when the menu
   * needs service-window behavior; do not infer it from Kitchen or Place.
   */
  sort_order: 0 as number,
  doc_url: '' as string,
  doc_name: '' as string,
  doc_type: '' as string,
  doc_storage_path: '' as string,
  ordering_enabled: false as boolean,
  ordering_modes: [] as KitchenOrderType[],
  // Browse is implicit for structured menus; use public_views for extra modes such as order.
  public_views: [] as MenuView[],
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

export type Menu = MutableModel<typeof MenuModel>

export type MenuCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<
  Omit<Menu, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
