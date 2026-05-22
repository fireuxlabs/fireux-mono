import type { Dish } from '../../../models/dish.model'
import type { Menu, MenuItem, MenuSection } from '../../../models/menu.model'

export type PublicMenuItemRow = {
  item: MenuItem
  dish: Dish | null
  label: string
  description: string
  price: number
}

export type PublicMenuSectionRow = {
  section: MenuSection
  items: PublicMenuItemRow[]
}

export type EmbeddedMenuItem = MenuItem & {
  active?: boolean
  label?: string
  labels?: unknown
  description?: string
  descriptions?: unknown
  price_options?: Array<{ price?: number }>
}

export type EmbeddedMenuSection = MenuSection & {
  active?: boolean
  labels?: unknown
  descriptions?: unknown
  items?: EmbeddedMenuItem[]
}

export type MenuWithEmbeddedSections = {
  sections?: EmbeddedMenuSection[]
  names?: unknown
  descriptions?: unknown
}

export const ROOT_KITCHENS = 'kitchens'
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
export const isActiveChild = <T extends { status?: unknown; active?: unknown }>(value: T) =>
  value.status !== 'archived' && value.active !== false

export const isPublicMenu = (menu: Menu & { active?: unknown }) =>
  clean(menu.status) === 'published' || (!clean(menu.status) && menu.active === true)

export const resolveItemPrice = (item: EmbeddedMenuItem | MenuItem): number => {
  const price = Number(item.price || 0)
  if (Number.isFinite(price) && price > 0) return price

  const options = Array.isArray((item as EmbeddedMenuItem).price_options)
    ? (item as EmbeddedMenuItem).price_options ?? []
    : []
  const optionPrice = Number(
    options.find((option) => Number(option.price || 0) > 0)?.price || 0
  )

  return Number.isFinite(optionPrice) ? optionPrice : 0
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
