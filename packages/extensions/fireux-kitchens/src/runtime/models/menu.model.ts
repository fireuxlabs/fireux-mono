// FILE: packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Minimal canon menu model for kitchens (Phase 1).
 * Firestore: kitchens/{kitchenId}/menus/{menuId}
 *
 * Publishing structure only, optimized for current product needs.
 */

export type MenuServiceMode = 'dine_in' | 'collection' | 'delivery'

export type MenuSectionItem = {
  id: string
  dish_id: string

  label: string
  price_minor: number
  sort_order: number

  // Optional item overrides (resolved at runtime from section/menu defaults)
  description?: string
  currency_code?: string
  photo_url?: string
  active?: boolean
}

export type MenuItemDefaults = {
  currency_code: string
  active: boolean
  description: string
  photo_url: string
}

export type MenuSection = {
  id: string
  label: string
  description: string
  items: MenuSectionItem[]
  sort_order: number
  defaults?: Partial<MenuItemDefaults>
}

export const Menu = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,

  // Publishing toggle for this menu record (separate from per-mode availability)
  active: true as boolean,

  // Default currency for items
  currency_code: 'CHF' as string,
  defaults: {
    currency_code: 'CHF',
    active: true,
    description: '',
    photo_url: '',
  } as Partial<MenuItemDefaults>,

  // If empty/undefined in existing docs, treat as ['dine_in'] in view logic.
  service_modes: ['dine_in'] as MenuServiceMode[],

  // Canon sectioned menu shape
  sections: [] as MenuSection[],
  sort_order: 0 as number,

  app_id: '' as FireuxStamped['app_id'],
  creator_id: '' as FireuxStamped['creator_id'],
  created_at: {} as FirebaseTimestamp,
  updated_at: {} as FirebaseTimestamp,
} as const

export type Menu = {
  [K in keyof typeof Menu]: (typeof Menu)[K]
}

export type MenuCreateInput = Omit<
  Menu,
  'app_id' | 'creator_id' | 'created_at' | 'updated_at'
>
export type MenuUpdateInput = Partial<Omit<MenuCreateInput, 'id' | 'kitchen_id'>>
