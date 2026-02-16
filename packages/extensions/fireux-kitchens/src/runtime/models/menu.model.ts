// FILE: packages/extensions/fireux-kitchens/src/runtime/models/menu.model.ts

import type { FireuxStamped } from 'fireux-core/runtime/models/core/meta.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Canon menu model for kitchens.
 * Firestore: kitchens/{kitchenId}/menus/{menuId}
 *
 * This model stays runtime-first while providing a stable structure
 * for future Google Business Profile menu + ordering-link projection.
 */

export type MenuStatus = 'draft' | 'live' | 'paused' | 'archived'
export type MenuService = 'all_day' | 'breakfast' | 'lunch' | 'dinner' | 'custom'
export type MenuOrderingActionType = 'FOOD_ORDERING' | 'FOOD_DELIVERY' | 'FOOD_TAKEOUT'
export type MenuServiceDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type MenuServiceRules = {
  days: MenuServiceDay[]
  start_time: string
  end_time: string
}

export type MenuSectionItem = {
  id: string
  dish_id: string
  label: string
  description: string
  price_minor: number
  currency_code: string
  photo_url: string
  tags: string[]
  allergens: string[]
  dietary_flags: string[]
  active: boolean
  sort_order: number
}

export type MenuSection = {
  id: string
  label: string
  description: string
  items: MenuSectionItem[]
  sort_order: number
}

export type MenuOrderingLink = {
  id: string
  uri: string
  action_type: MenuOrderingActionType
  preferred: boolean
}

export type MenuGoogleSyncState = {
  enabled: boolean
  source_url: string
  ordering_links: MenuOrderingLink[]
  last_synced_at: FirebaseTimestamp
  last_sync_error: string
  last_sync_version: string
}

export const Menu = {
  id: '' as string,
  kitchen_id: '' as string,

  name: '' as string,
  description: '' as string,
  status: 'draft' as MenuStatus,
  service: 'all_day' as MenuService,
  service_rules: {
    days: [] as MenuServiceDay[],
    start_time: '',
    end_time: '',
  } as MenuServiceRules,

  // Legacy + current runtime references
  dish_ids: [] as string[],
  stations: [] as string[],

  // Canon sectioned menu shape (future-proof for external projections)
  sections: [] as MenuSection[],
  sort_order: 0 as number,

  // Stable public menu URL for website/GBP attribute projection
  url_menu: '' as string,

  // External projection metadata (Google sync-compatible)
  google_sync: {
    enabled: false,
    source_url: '',
    ordering_links: [] as MenuOrderingLink[],
    last_synced_at: {} as FirebaseTimestamp,
    last_sync_error: '',
    last_sync_version: '',
  } as MenuGoogleSyncState,

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

// Google projection helpers (API-agnostic but shape-compatible)
export type GoogleFoodMenusProjection = {
  labels: string[]
  sourceUrl: string
  sections: Array<{
    labels: string[]
    description: string
    items: Array<{
      labels: string[]
      description: string
      price: {
        currencyCode: string
        amountMicros: number
      }
      photoUri: string
      active: boolean
      allergens: string[]
      dietaryFlags: string[]
    }>
  }>
}

export type GooglePlaceActionLinkProjection = {
  uri: string
  placeActionType: MenuOrderingActionType
  isPreferred: boolean
}

const toLabel = (value: string, fallback: string) => {
  const clean = String(value || '').trim()
  return clean || fallback
}

export const buildGoogleFoodMenusProjection = (
  menu: Menu
): GoogleFoodMenusProjection => ({
  labels: [toLabel(menu.name, 'Menu')],
  sourceUrl: String(menu.google_sync?.source_url || menu.url_menu || '').trim(),
  sections: (menu.sections ?? []).map((section) => ({
    labels: [toLabel(section.label, 'Section')],
    description: String(section.description || '').trim(),
    items: (section.items ?? []).map((item) => ({
      labels: [toLabel(item.label, 'Item')],
      description: String(item.description || '').trim(),
      price: {
        currencyCode: String(item.currency_code || 'GBP').trim(),
        amountMicros: Math.max(0, Number(item.price_minor || 0)) * 10000,
      },
      photoUri: String(item.photo_url || '').trim(),
      active: Boolean(item.active),
      allergens: [...(item.allergens ?? [])],
      dietaryFlags: [...(item.dietary_flags ?? [])],
    })),
  })),
})

export const buildGooglePlaceActionLinksProjection = (
  menu: Menu
): GooglePlaceActionLinkProjection[] =>
  (menu.google_sync?.ordering_links ?? []).map((link) => ({
    uri: String(link.uri || '').trim(),
    placeActionType: link.action_type,
    isPreferred: Boolean(link.preferred),
  }))
