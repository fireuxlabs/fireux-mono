// Concurrent edit — 2026-07-22 02:08 CEST — Dish media ownership: name the food-owned field image, independent of its Storage transport.
import { defineFireuxEntity } from 'fireux-core/runtime/models/utils/entity.model'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped Entity
 * Storage: Kitchen-owned reusable food identity
 * Path: apps/{appId}/kitchens/{kitchenId}/dishes/{dishId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Dish owns guest-facing food copy and an optional image. Menus decide where
 * dishes appear and which price/options apply in that menu context.
 * Ingredients, prep, recipes, pricing, stock, and service workflow are not
 * active on the Dish model yet.
 */
export const DishStorage = {
  shape: 'scoped',
  path: 'apps/{appId}/kitchens/{kitchenId}/dishes/{dishId}',
  collection: 'dishes',
  parent: 'kitchen',
  idParam: 'dishId',
} as const

export const DishEntity = defineFireuxEntity({
  kind: 'entity',
  name: 'Dish',
  family: ['kitchen', 'menu'],
  identity: 'parent-scoped',
  authority: 'parent',
  appSupport: 'none',
  publicRead: 'none',
  console: false,
  parent: 'Kitchen',
  scoped: DishStorage.path,
})

export type DishItemKind = 'food' | 'drink'

export const readDishItemKind = (value: unknown): DishItemKind | '' => {
  const kind = String(value ?? '').trim().toLowerCase().replace(/[-\s]+/g, '_')

  if (kind === 'food' || kind === 'drink') return kind
  if (kind === 'drinks') return 'drink'

  return ''
}

export const normalizeDishItemKind = (value: unknown): DishItemKind =>
  readDishItemKind(value) || 'food'

export const normalizeDishDealFlag = (value: unknown) =>
  value === true ||
  ['true', 'yes', '1'].includes(String(value ?? '').trim().toLowerCase())

export const normalizeDishFlagshipFlag = (value: unknown) => value === true

export const DishDefaults = {
  id: '' as string,
  name: '' as string,
  slug: '' as string,
  description: '' as string,
  item_kind: 'food' as DishItemKind,
  is_deal: false as boolean,
  is_flagship: false as boolean,
  image: '' as string,
  kitchen_id: '' as string,
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

type DishBase = {
  -readonly [K in keyof typeof DishDefaults]: (typeof DishDefaults)[K]
}

export type Dish = DishBase

export type DishCreateInput = Omit<Dish, 'created' | 'updated'>
export type DishUpdateInput = Partial<
  Omit<Dish, 'id' | 'created' | 'updated' | 'kitchen_id'>
>

const pickString = (value: unknown) => String(value ?? '').trim()

export function normalizeDish(value: unknown): Dish {
  const source = value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created = source.created && typeof source.created === 'object'
    ? (source.created as Dish['created'])
    : DishDefaults.created
  const updated = source.updated && typeof source.updated === 'object'
    ? (source.updated as Dish['updated'])
    : DishDefaults.updated

  return {
    ...DishDefaults,
    id: pickString(source.id),
    name: pickString(source.name),
    slug: pickString(source.slug),
    description: pickString(source.description),
    item_kind: normalizeDishItemKind(source.item_kind),
    is_deal: normalizeDishDealFlag(source.is_deal),
    is_flagship: normalizeDishFlagshipFlag(source.is_flagship),
    image: pickString(source.image),
    kitchen_id: pickString(source.kitchen_id),
    created,
    updated,
  }
}
