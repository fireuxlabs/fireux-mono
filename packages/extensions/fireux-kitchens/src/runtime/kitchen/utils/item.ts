import { readItemReferenceIds } from './item-preparation'
import { normalizeItemPricingPatch } from './item-pricing'
// Concurrent edit — 2026-07-22 02:08 CEST — Item media ownership: name the food-owned field image, independent of its Storage transport.
import type { Item } from '../records/menus/items/item'
import type {
  ItemPricing,
  ItemPriceOption,
  ItemAddOnOption,
} from './item-pricing'
import type { ItemOffer } from '../records/menus/items/item-offer'
import { readItemIdentity } from './item-identity'

export type ItemCollectionRow = Item &
  Partial<ItemOffer> & {
    price_options: ItemPriceOption[]
    add_ons: ItemAddOnOption[]
    description: string
    image: string
    slug: string
    kitchen_id: string
    item_kind?: string
    pricing_error?: string
    is_flagship: boolean
    group_ids: string[]
    preparation_station_ids?: string[]
  }

/** Historical collection presentation; this is not the canonical Item record. */
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

const pickString = (value: unknown) => String(value ?? '').trim()

export function normalizeItem(value: unknown): ItemCollectionRow {
  const source =
    value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  let pricing: ItemPricing = { price_options: [], add_ons: [] }
  let pricingError = ''
  try {
    pricing = {
      price_options: [],
      add_ons: [],
      ...normalizeItemPricingPatch({
        ...(Object.hasOwn(source, 'price') ? { price: source.price } : {}),
        ...(Object.hasOwn(source, 'choice_groups')
          ? { choice_groups: source.choice_groups }
          : {}),
        price_options: source.price_options ?? [],
        add_ons: source.add_ons ?? [],
      }),
    }
  } catch (error) {
    pricingError =
      error instanceof Error ? error.message : 'Review Item selling defaults.'
  }
  return {
    ...readItemIdentity(pickString(source.id), source),
    ...pricing,
    ...(pricingError ? { pricing_error: pricingError } : {}),
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
  }
}
