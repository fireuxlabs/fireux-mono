import type { Dish } from '../../../models/dish.model'
import type { Product } from 'fireux-products/runtime/models/product.model'
import type { Menu, MenuItem, MenuSection } from '../../../models/menu.model'

export type PublicMenuItemRow = {
  item: MenuItem
  dish: Dish | null
  product: Product | null
  label: string
  description: string
  price: number
}

export type PublicMenuSectionRow = {
  section: MenuSection
  items: PublicMenuItemRow[]
}

export const clean = (value: unknown) => String(value ?? '').trim()
export const cleanIdentity = (value: unknown) => clean(value).toLowerCase()
export const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
export const queryString = (value: unknown) =>
  Array.isArray(value) ? clean(value[0]) : clean(value)
export const sortBySortOrder = <T extends { sort_order?: unknown }>(items: T[]) =>
  [...items].sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0))
export const isActiveChild = <T extends { status?: unknown }>(value: T) =>
  value.status !== 'archived'

export const isPublicMenu = (menu: Menu) => clean(menu.status) === 'published'

export const resolveItemPrice = (item: MenuItem): number => {
  const price = Number(item.price || 0)
  if (Number.isFinite(price) && price > 0) return price

  return 0
}

export const resolveProductPrice = (product: Product | null): number => {
  const unitAmount = Number(product?.default_price?.unit_amount || 0)
  if (!Number.isFinite(unitAmount) || unitAmount <= 0) return 0

  return unitAmount / 100
}

export const menuFieldId = (menu: Pick<Menu, 'id'>, field: string) =>
  `menu:${clean(menu.id)}:${field}`
export const sectionFieldId = (
  menu: Pick<Menu, 'id'>,
  section: Pick<MenuSection, 'id'>,
  field: string
) => `menu:${clean(menu.id)}:section:${clean(section.id)}:${field}`
export const itemFieldId = (
  menu: Pick<Menu, 'id'>,
  section: Pick<MenuSection, 'id'>,
  item: Pick<MenuItem, 'id'>,
  field: string
) => `menu:${clean(menu.id)}:section:${clean(section.id)}:item:${clean(item.id)}:${field}`
export const dishFieldId = (dish: Pick<Dish, 'id'>, field: string) =>
  `dish:${clean(dish.id)}:${field}`
