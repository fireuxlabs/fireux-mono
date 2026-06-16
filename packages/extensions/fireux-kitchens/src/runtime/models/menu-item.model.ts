import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Family: App-scoped Kitchen Menu Section child record.
 *
 * MenuItem is a placement link to a Dish. Dish owns food truth; MenuItem only
 * owns menu placement state such as section, order, status, and price override.
 */
export const MenuItemStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/menus/{menuId}/sections/{sectionId}/items/{itemId}',
  collection: 'items',
  parent: 'menu-section',
  idParam: 'itemId',
} as const

export type MenuItemStatus = 'active' | 'archived'

export type MenuItemPriceOption = {
  quantity: number
  unit: string
  price: number
}

const cleanText = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown) =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export function normalizeMenuItemPriceOptions(value: unknown): MenuItemPriceOption[] {
  if (!Array.isArray(value)) return []

  return value
    .map((option) => {
      const data = record(option)
      return {
        quantity: Number(data.quantity || 0),
        unit: cleanText(data.unit),
        price: Number(data.price || 0),
      }
    })
    .filter((option) => option.quantity > 0 && option.price > 0)
}

export const MenuItemModel = {
  id: '' as string,
  kitchen_id: '' as string,
  menu_id: '' as string,
  section_id: '' as string,
  dish_id: '' as string,
  price: 0 as number,
  price_options: [] as MenuItemPriceOption[],
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
