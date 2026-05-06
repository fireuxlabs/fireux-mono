// FILE: packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped
 * Storage: scoped operational record
 * Path: /kitchens/<kitchenId>/menus/<menuId>
 * Owner app scope: Kitchen
 *
 * Decision note:
 * - Menu exists because a kitchen publishes and organizes it.
 * - It stays scoped to the kitchen even when the public site renders it.
 * - If that changes later, update the models README first, then this file.
 */

export type MenuServiceMode = 'dine_in' | 'collection' | 'delivery'

export type MenuDesign = {
  background_hex?: string
  text_hex?: string
}

export type MenuSectionItem = {
  id: string
  dish_id?: string

  label?: string
  price_minor: number
  sort_order: number

  // Optional item overrides (resolved at runtime from section/menu defaults)
  description?: string
  photo_url?: string
  active?: boolean
}

export type MenuItemDefaults = {
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

export const MenuModel = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,

  // Publishing toggle for this menu record (separate from per-mode availability)
  active: true as boolean,

  defaults: {
    active: true,
    description: '',
    photo_url: '',
  } as Partial<MenuItemDefaults>,

  // If empty/undefined in existing docs, treat as ['dine_in'] in view logic.
  service_modes: ['dine_in'] as MenuServiceMode[],

  // Canon sectioned menu shape
  sections: [] as MenuSection[],
  sort_order: 0 as number,

  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
  },
} as const

export type Menu = {
  [K in keyof typeof MenuModel]: (typeof MenuModel)[K]
} & {
  design?: MenuDesign
}

export type MenuCreateInput = Omit<Menu, 'created' | 'updated'>
export type MenuUpdateInput = Partial<Omit<Menu, 'id' | 'created' | 'updated' | 'kitchen_id'>>
