import { readItemReferenceIds } from './item-preparation'
import { normalizeItemPricingPatch } from './item-pricing'
// Concurrent edit — 2026-07-22 02:08 CEST — Item media ownership: name the food-owned field image, independent of its Storage transport.
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type { Item } from '../models/item.model'

export type { Item } from '../models/item.model'

/**
 * Model conventions: docs/concepts/core-models.md#entity-model-file-shape
 *
 * Family: Kitchen-scoped Entity
 * Storage: Kitchen-owned reusable food identity
 * Path: kitchens/{kitchenId}/dishes/{dishId}
 * Owner app scope: Kitchen within an app runtime
 *
 * Item owns guest-facing food copy and an optional image. Menus decide where
 * dishes appear. Item owns normal prices, options and extras; Promotions own overrides.
 * Optional spec owns per-portion ingredient/prep references, recipe links and
 * assembly. It does not record stock, production execution or menu pricing.
 */
export const readLegacyItemKind = (value: unknown): string => {
  const kind = String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[-\s]+/g, '_')

  if (kind === 'food' || kind === 'drink') return kind
  if (kind === 'drinks') return 'drink'

  return ''
}

export const normalizeLegacyItemKind = (value: unknown): string =>
  readLegacyItemKind(value) || 'food'

export const normalizeItemFlagshipFlag = (value: unknown) => value === true

export const ItemDefaults = {
  id: '' as string,
  name: '' as string,
  slug: '' as string,
  description: '' as string,
  is_flagship: false as boolean,
  image: '' as string,
  kitchen_id: '' as string,
  price_options: [] as Item['price_options'],
  add_ons: [] as Item['add_ons'],
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

export type ItemUpdateInput = Partial<
  Pick<
    Item,
    | 'name'
    | 'slug'
    | 'description'
    | 'category'
    | 'spec'
    | 'price'
    | 'price_options'
    | 'add_ons'
    | 'bottle_deposit'
    | 'choice_groups'
  >
> & { preparation_station_ids?: string[] | null }

const pickString = (value: unknown) => String(value ?? '').trim()

export function normalizeItem(value: unknown): Item {
  const source =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  const created =
    source.created && typeof source.created === 'object'
      ? (source.created as Item['created'])
      : ItemDefaults.created
  const updated =
    source.updated && typeof source.updated === 'object'
      ? (source.updated as Item['updated'])
      : ItemDefaults.updated

  return {
    ...ItemDefaults,
    ...normalizeItemPricingPatch({
      ...(Object.hasOwn(source, 'price') ? { price: source.price } : {}),
      ...(Object.hasOwn(source, 'choice_groups')
        ? { choice_groups: source.choice_groups }
        : {}),
      price_options: source.price_options ?? [],
      add_ons: source.add_ons ?? [],
      ...(source.bottle_deposit !== undefined
        ? { bottle_deposit: source.bottle_deposit }
        : {}),
    }),
    id: pickString(source.id),
    name: pickString(source.name),
    slug: pickString(source.slug),
    description: pickString(source.description),
    item_kind: readLegacyItemKind(source.item_kind) || undefined,
    group_ids: readItemReferenceIds(source.group_ids),
    ...(Array.isArray(source.preparation_station_ids)
      ? {
          preparation_station_ids: readItemReferenceIds(
            source.preparation_station_ids
          ),
        }
      : {}),
    is_flagship: normalizeItemFlagshipFlag(source.is_flagship),
    image: pickString(source.image),
    kitchen_id: pickString(source.kitchen_id),
    ...(source.spec && typeof source.spec === 'object'
      ? { spec: source.spec as Item['spec'] }
      : {}),
    ...(typeof source.category === 'string' && source.category.trim()
      ? { category: source.category.trim() }
      : {}),
    created,
    updated,
  }
}
