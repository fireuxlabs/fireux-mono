import type {
  Menu,
  MenuItemDefaults,
  MenuSection,
  MenuSectionItem,
} from '../../../../../../../models/menu.model'

export type ResolvedMenuItemView = Omit<
  MenuSectionItem,
  'currency_code' | 'active' | 'description' | 'photo_url'
> &
  MenuItemDefaults

const pickString = (value: unknown, fallback: string) => {
  const next = String(value ?? '').trim()
  return next || fallback
}

const pickBoolean = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback

const pickNumber = (value: unknown, fallback = 0) => {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

const resolveDefaults = (menu: Menu, section: MenuSection): MenuItemDefaults => {
  const menuDefaults = menu.defaults ?? {}
  const sectionDefaults = section.defaults ?? {}

  const menuCurrency = pickString(menu.currency_code, 'CHF')
  const defaultsCurrency = pickString(menuDefaults.currency_code, menuCurrency)
  const defaultsActive = pickBoolean(menuDefaults.active, true)
  const defaultsDescription = pickString(menuDefaults.description, '')
  const defaultsPhotoUrl = pickString(menuDefaults.photo_url, '')

  return {
    currency_code: pickString(sectionDefaults.currency_code, defaultsCurrency),
    active: pickBoolean(sectionDefaults.active, defaultsActive),
    description: pickString(sectionDefaults.description, defaultsDescription),
    photo_url: pickString(sectionDefaults.photo_url, defaultsPhotoUrl),
  }
}

export const resolveMenuItemView = (
  menu: Menu,
  section: MenuSection,
  item: MenuSectionItem
): ResolvedMenuItemView => {
  const defaults = resolveDefaults(menu, section)

  return {
    id: pickString(item.id, ''),
    dish_id: pickString(item.dish_id, ''),
    label: pickString(item.label, ''),
    price_minor: pickNumber(item.price_minor, 0),
    sort_order: pickNumber(item.sort_order, 0),
    currency_code: pickString(item.currency_code, defaults.currency_code),
    active: pickBoolean(item.active, defaults.active),
    description: pickString(item.description, defaults.description),
    photo_url: pickString(item.photo_url, defaults.photo_url),
  }
}

