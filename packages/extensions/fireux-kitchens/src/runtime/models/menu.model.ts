import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Both-facing app-scoped Kitchen presentation records.
 *
 * Menu is managed under the app-scoped Kitchen record. A Kitchen can start in
 * the Misebox app and later move into its own app, but Menu storage remains
 * app-scoped either way. Menu is "both" because it has a Kitchen Console
 * management facade and a public published facade.
 *
 * Dish describes food. Menu presents selected dishes. MenuItem is a
 * placement/link to a Dish, not a second food entity.
 *
 * Canon paths:
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}
 * - apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}
 */
export const MenuStorage = {
  shape: 'both',
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

export const MenuSectionStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}',
  collection: 'sections',
  parent: 'menu',
  idParam: 'sectionId',
} as const

export const MenuItemStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  collection: 'items',
  parent: 'menu-section',
  idParam: 'itemId',
} as const

export type MenuStatus = 'draft' | 'published' | 'archived'
export type MenuChildStatus = 'active' | 'archived'

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
  source_language: '' as string,
  status: 'draft' as MenuStatus,
  sort_order: 0 as number,
  doc_url: '' as string,
  doc_name: '' as string,
  doc_type: '' as string,
  doc_storage_path: '' as string,
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

export const MenuSectionModel = {
  id: '' as string,
  kitchen_id: '' as string,
  menu_id: '' as string,
  label: '' as string,
  description: '' as string,
  status: 'active' as MenuChildStatus,
  sort_order: 0 as number,
  created: MenuModel.created,
  updated: MenuModel.updated,
} as const

export const MenuItemModel = {
  id: '' as string,
  kitchen_id: '' as string,
  menu_id: '' as string,
  section_id: '' as string,
  // Placement link: Dish owns food truth; MenuItem only positions it on a menu.
  dish_id: '' as string,
  // Current override field. Keep lightweight; do not duplicate Dish copy here.
  price: 0 as number,
  status: 'active' as MenuChildStatus,
  sort_order: 0 as number,
  created: MenuModel.created,
  updated: MenuModel.updated,
} as const

type MutableModel<T> = {
  -readonly [K in keyof T]: T[K]
}

export type Menu = MutableModel<typeof MenuModel>
export type MenuSection = MutableModel<typeof MenuSectionModel>
export type MenuItem = MutableModel<typeof MenuItemModel>

export type MenuCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<
  Omit<Menu, 'id' | 'created' | 'updated' | 'kitchen_id'>
>
export type MenuSectionCreateInput = Omit<MenuSection, 'created' | 'updated'>
export type MenuSectionUpdateInput = Partial<
  Omit<MenuSection, 'id' | 'created' | 'updated' | 'kitchen_id' | 'menu_id'>
>
export type MenuItemCreateInput = Omit<MenuItem, 'created' | 'updated'>
export type MenuItemUpdateInput = Partial<
  Omit<
    MenuItem,
    'id' | 'created' | 'updated' | 'kitchen_id' | 'menu_id' | 'section_id'
  >
>
