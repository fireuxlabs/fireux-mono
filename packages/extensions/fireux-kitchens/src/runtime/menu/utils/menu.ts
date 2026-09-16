import type { Menu } from '../models/menu.model'

export type * from '../models/menu.model'
export type * from '../models/kitchen-menu.model'

export const MenuStorage = {
  shape: 'root',
  path: 'menus/{menuId}',
  root: 'menus/{menuId}',
  collection: 'menus',
  rootCollection: 'menus',
  idParam: 'menuId',
} as const
export type MenuCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<Omit<Menu, 'id' | 'created' | 'updated'>>
