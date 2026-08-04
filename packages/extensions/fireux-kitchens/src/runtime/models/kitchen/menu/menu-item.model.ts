// Concurrent edit — 2026-07-20 23:30 CEST — Entity Vocabulary + Matrix Pass: classify items as MenuSection-owned scoped records.
// Concurrent edit — 2026-07-22 01:58 CEST — Dish/MenuItem boundary: keep food media on Dish and commercial placement on MenuItem.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model.ts'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: App-scoped Kitchen Menu Section child record.
 *
 * MenuItem is a placement link to a Dish. Dish owns food truth; MenuItem owns
 * menu placement state such as section, order, availability, price, variants,
 * and add-ons. Food copy and media remain on Dish.
 */
export const MenuItemStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  collection: 'items',
  parent: 'menu-section',
  idParam: 'itemId',
} as const

export const MenuItemRecord = defineFireuxEntity({
  kind: 'record',
  name: 'MenuItem',
  family: 'menu',
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  status: 'confirmed',
  parent: 'MenuSection',
  scoped: MenuItemStorage.path,
  notes: [
    'MenuItem places a Dish in a MenuSection.',
    'Dish owns food truth and media; MenuItem owns placement, order, availability, price, variants, and add-ons.',
  ],
})

export type MenuItemStatus = 'active' | 'archived'

export type MenuItemPriceOption = {
  label: string
  quantity: number
  unit: string
  /** Absolute full item price for this required selection; always greater than zero. */
  price: number
}

export type MenuItemAddOnOption = {
  id: string
  label: string
  /** Incremental surcharge; zero is valid for a labelled optional free add-on. */
  price: number
}

const cleanText = (value: unknown) => String(value ?? '').trim()
const cleanNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}
const cleanNonNegativePrice = (value: unknown) => {
  if (value === null || value === undefined || cleanText(value) === '') return -1
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : -1
}
const quantityFromLabel = (label: string) => {
  const match = label.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-ZäöüÄÖÜ]+)?/)

  return {
    quantity: match ? cleanNumber(match[1]?.replace(',', '.')) : 0,
    unit: cleanText(match?.[2]),
  }
}
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function normalizeMenuItemPriceOptions(value: unknown): MenuItemPriceOption[] {
  if (!Array.isArray(value)) return []

  return value
    .map((option) => {
      const data = record(option)
      const label = cleanText(data.label)
      const parsed = quantityFromLabel(label)
      const quantity = cleanNumber(data.quantity) || parsed.quantity
      const unit = cleanText(data.unit) || parsed.unit

      return {
        label: label || [quantity || '', unit].filter(Boolean).join(' '),
        quantity,
        unit,
        price: cleanNumber(data.price),
      }
    })
    .filter((option) => option.label && option.price > 0)
}

export function normalizeMenuItemAddOns(value: unknown): MenuItemAddOnOption[] {
  if (!Array.isArray(value)) return []

  return value
    .map((option, optionIndex) => {
      const data = record(option)
      const label = cleanText(data.label)

      return {
        id:
          cleanText(data.id) ||
          label.toLowerCase().replace(/[^a-z0-9]+/g, '-') ||
          `add-on-${optionIndex + 1}`,
        label,
        price: cleanNonNegativePrice(data.price),
      }
    })
    .filter((option) => option.id && option.label && option.price >= 0)
}

export const MenuItemModel = {
  id: '' as string,
  kitchen_id: '' as string,
  menu_id: '' as string,
  section_id: '' as string,
  dish_id: '' as string,
  price: 0 as number,
  price_options: [] as MenuItemPriceOption[],
  add_ons: [] as MenuItemAddOnOption[],
  status: 'active' as MenuItemStatus,
  sort_order: 0 as number,
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

export type MenuItem = MutableModel<typeof MenuItemModel>

export type MenuItemCreateInput = Omit<MenuItem, 'created' | 'updated'>
export type MenuItemUpdateInput = Partial<
  Omit<
    MenuItem,
    'id' | 'created' | 'updated' | 'kitchen_id' | 'menu_id' | 'section_id'
  >
>
