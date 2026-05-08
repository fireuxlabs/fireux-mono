import type {
  Menu,
  MenuItemDefaults,
  MenuSection,
  MenuSectionItem,
} from '../../../../../../../models/menu.model'
import type { Dish } from '../../../../../../../models/dish.model'

export type ResolvedMenuItemView = Omit<
  MenuSectionItem,
  'active' | 'description' | 'photo_url'
> &
  MenuItemDefaults & {
    names?: Record<string, string>
    descriptions?: Record<string, string>
  }

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

const pickStringRecord = (value: unknown): Record<string, string> | undefined => {
  if (!value || typeof value !== 'object') return undefined

  const entries = Object.entries(value as Record<string, unknown>)
    .map(([key, entry]) => [pickString(key, ''), pickString(entry, '')] as const)
    .filter(([key, entry]) => key && entry)

  return entries.length ? Object.fromEntries(entries) : undefined
}

const pickLocalizedFallback = (
  value: Record<string, string> | undefined
): string => {
  if (!value) return ''

  return (
    pickString(value.de, '') ||
    pickString(value.en, '') ||
    pickString(value.it, '') ||
    pickString(value.fr, '') ||
    pickString(Object.values(value)[0], '')
  )
}

const resolveDefaults = (
  menu: Menu,
  section: MenuSection
): MenuItemDefaults => {
  const menuDefaults = menu.defaults ?? {}
  const sectionDefaults = section.defaults ?? {}

  const defaultsActive = pickBoolean(menuDefaults.active, true)
  const defaultsDescription = pickString(menuDefaults.description, '')
  const defaultsPhotoUrl = pickString(menuDefaults.photo_url, '')

  return {
    active: pickBoolean(sectionDefaults.active, defaultsActive),
    description: pickString(sectionDefaults.description, defaultsDescription),
    photo_url: pickString(sectionDefaults.photo_url, defaultsPhotoUrl),
  }
}

export const resolveMenuItemView = (
  menu: Menu,
  section: MenuSection,
  item: MenuSectionItem,
  options: {
    dish?: Dish | null | undefined
  } = {}
): ResolvedMenuItemView => {
  const defaults = resolveDefaults(menu, section)
  const dish = options.dish ?? null
  const names = pickStringRecord((dish as any)?.names)
  const descriptions = pickStringRecord((dish as any)?.descriptions)
  const dishName =
    pickLocalizedFallback(names) ||
    pickString((dish as any)?.name, '')
  const dishDescription =
    pickLocalizedFallback(descriptions) ||
    pickString((dish as any)?.description, '')

  return {
    id: pickString(item.id, ''),
    dish_id: pickString(item.dish_id, ''),
    label: pickString(item.label, dishName),
    price: pickNumber(item.price, 0),
    sort_order: pickNumber(item.sort_order, 0),
    active: pickBoolean(item.active, defaults.active),
    description: pickString(item.description, dishDescription || defaults.description),
    photo_url: pickString(item.photo_url, defaults.photo_url),
    names,
    descriptions,
  }
}
