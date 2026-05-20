import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: Kitchen-scoped presentation records.
 *
 * Kitchen runs the operation. Dish describes food. Menu presents selected
 * dishes. QR points guests to one published menu URL.
 *
 * Canon paths:
 * - kitchens/{kitchenId}/menus/{menuId}
 * - kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}
 * - kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}
 */

export type MenuServiceMode = 'dine_in' | 'collection' | 'delivery'
export type MenuStatus = 'draft' | 'published' | 'archived'
export type MenuChildStatus = 'active' | 'archived'

export type MenuDesign = {
  color_mode: 'light' | 'dark'
}

export const MenuModel = {
  id: '' as string,
  kitchen_id: '' as string,
  name: '' as string,
  description: '' as string,
  status: 'draft' as MenuStatus,
  service_modes: ['dine_in'] as MenuServiceMode[],
  sort_order: 0 as number,
  design: {
    color_mode: 'light',
  } as MenuDesign,
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
  dish_id: '' as string,
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
