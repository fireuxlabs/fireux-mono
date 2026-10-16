import { readDishPricing } from './dish-pricing'
// Concurrent edit — 2026-07-22 02:08 CEST — Dish media ownership: name the food-owned field image, independent of its Storage transport.
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import { dishCategories } from '../models/dish.model'
import type { Dish, DishItemKind } from '../models/dish.model'

export type { Dish, DishItemKind } from '../models/dish.model'

/**
 * Runtime models canon: packages/core/fireux-docs/src/runtime/models/README.md
 *
 * Family: Kitchen-scoped Entity
 * Storage: Kitchen-owned reusable food identity
 * Path: kitchens/{kitchenId}/dishes/{dishId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Dish owns guest-facing food copy and an optional image. Menus decide where
 * dishes appear. Dish owns normal prices, options and extras; Promotions own overrides.
 * Optional spec owns per-portion ingredient/prep references, recipe links and
 * assembly. It does not record stock, production execution or menu pricing.
 */
export const DishStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/dishes/{dishId}',
  collection: 'dishes',
  parent: 'kitchen',
  idParam: 'dishId',
} as const

export const readDishItemKind = (value: unknown): DishItemKind | '' => {
  const kind = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')

  if (kind === 'food' || kind === 'drink') return kind
  if (kind === 'drinks') return 'drink'

  return ''
}

export const normalizeDishItemKind = (value: unknown): DishItemKind =>
  readDishItemKind(value) || 'food'

export const normalizeDishFlagshipFlag = (value: unknown) => value === true

export const DishDefaults = {
  id: '' as string,
  name: '' as string,
  slug: '' as string,
  description: '' as string,
  item_kind: 'food' as DishItemKind,
  is_flagship: false as boolean,
  image: '' as string,
  kitchen_id: '' as string,
  price: 0,
  price_options: [] as Dish['price_options'],
  add_ons: [] as Dish['add_ons'],
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

export type DishUpdateInput = Partial<
  Pick<
    Dish,
    | 'name'
    | 'slug'
    | 'description'
    | 'category'
    | 'spec'
    | 'price'
    | 'price_options'
    | 'add_ons'
  >
>

const pickString = (value: unknown) => String(value ?? '').trim()

export function normalizeDish(value: unknown): Dish {
  const source =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created =
    source.created && typeof source.created === 'object'
      ? (source.created as Dish['created'])
      : DishDefaults.created
  const updated =
    source.updated && typeof source.updated === 'object'
      ? (source.updated as Dish['updated'])
      : DishDefaults.updated

  return {
    ...DishDefaults,
    ...readDishPricing({ ...DishDefaults, ...source }),
    id: pickString(source.id),
    name: pickString(source.name),
    slug: pickString(source.slug),
    description: pickString(source.description),
    item_kind: normalizeDishItemKind(source.item_kind),
    is_flagship: normalizeDishFlagshipFlag(source.is_flagship),
    image: pickString(source.image),
    kitchen_id: pickString(source.kitchen_id),
    ...(source.spec && typeof source.spec === 'object'
      ? { spec: source.spec as Dish['spec'] }
      : {}),
    ...(dishCategories.some((category) => category.value === source.category)
      ? { category: source.category as Dish['category'] }
      : {}),
    created,
    updated,
  }
}
