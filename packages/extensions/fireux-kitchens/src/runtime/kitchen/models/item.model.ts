import type {
  FireuxCreatedStamp,
  FireuxUpdatedStamp,
} from 'fireux-core/runtime/models/utils/stamps.model'

export type ItemKind = 'food' | 'drink'

export type ItemChoiceGroup = {
  id: string
  name: string
  min: number
  max: number | null
  pricing: 'full' | 'additional'
  options: Array<{ id: string; label: string; price: number }>
}

/** Selections are request state. */
export type ItemChoiceSelection = Record<string, string[]>

/** Kitchen-owned Item record. The reader supplies id from its path. */
export type Item = {
  id: string
  name: string
  description?: string
  item_kind?: ItemKind
  /** Base price for Items without a full-price choice group. */
  price?: number
  /** Denominates the base price and all choices on this Item. */
  currency_code?: string
  choice_groups?: ItemChoiceGroup[]
  /** One photographic image URL, delivered through the shared photo contract. */
  image?: string
  /** Older records may lack provenance; creation commands still write both stamps. */
  created?: FireuxCreatedStamp
  updated?: FireuxUpdatedStamp
}

export const ItemStorage = {
  shape: 'scoped',
  path: 'kitchens/{kitchenId}/items/{itemId}',
  collection: 'items',
  parent: 'kitchen',
  idParam: 'itemId',
} as const
