import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { FirebaseTimestamp } from 'fireux-core/types/firebase'
import type {
  KitchenPrepItem,
  KitchenPrepItemInput,
  KitchenPrepItemTranslatedText,
  KitchenPrepItemUnit,
  KitchenPrepItemYield,
} from '../models/prep-item.model'

export type {
  KitchenPrepItem,
  KitchenPrepItemInput,
  KitchenPrepItemTranslatedText,
  KitchenPrepItemUnit,
  KitchenPrepItemYield,
} from '../models/prep-item.model'

export const KitchenPrepItemDefaults = {
  id: '' as string,
  kitchen_id: '' as string,
  name: '' as string,
  slug: '' as string,
  description: '' as string,
  source_language: '' as string,
  names: {} as KitchenPrepItemTranslatedText,
  descriptions: {} as KitchenPrepItemTranslatedText,
  station: '' as string,
  inputs: [] as KitchenPrepItemInput[],
  recipe_id: '' as string,
  yield: { quantity: 0, unit: '' } as KitchenPrepItemYield,
  method: [] as string[],
  created: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['created']['by'],
    app_id: '' as FireuxStamped['created']['app_id'],
  },
  updated: {
    at: {} as FirebaseTimestamp,
    by: '' as FireuxStamped['updated']['by'],
  },
} as const satisfies KitchenPrepItem

const prepItemRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

const prepItemString = (value: unknown) => String(value ?? '').trim()
const prepItemQuantity = (value: unknown) => {
  const quantity = Number(value)
  return Number.isFinite(quantity) && quantity >= 0 ? quantity : 0
}

const prepItemUnits = new Set<KitchenPrepItemUnit>([
  '',
  'g',
  'ml',
  'each',
  'portion',
])

export const normalizeKitchenPrepItemUnit = (
  value: unknown
): KitchenPrepItemUnit => {
  const unit = prepItemString(value) as KitchenPrepItemUnit
  return prepItemUnits.has(unit) ? unit : ''
}

export function normalizeKitchenPrepItemTranslatedText(
  value: unknown
): KitchenPrepItemTranslatedText {
  const source = prepItemRecord(value)
  return Object.fromEntries(
    Object.entries(source)
      .map(([language, copy]) => [
        prepItemString(language).replace(/_/g, '-'),
        prepItemString(copy),
      ])
      .filter(([language, copy]) => language && copy)
  )
}

export function normalizeKitchenPrepItemInput(
  value: unknown
): KitchenPrepItemInput {
  const source = prepItemRecord(value)
  return {
    ingredient_id: prepItemString(source.ingredient_id),
    quantity: prepItemQuantity(source.quantity),
    unit: normalizeKitchenPrepItemUnit(source.unit),
    preparation: prepItemString(source.preparation),
  }
}

export function normalizeKitchenPrepItem(value: unknown): KitchenPrepItem {
  const source = prepItemRecord(value)
  const created = prepItemRecord(source.created)
  const updated = prepItemRecord(source.updated)
  const yieldValue = prepItemRecord(source.yield)

  return {
    ...KitchenPrepItemDefaults,
    id: prepItemString(source.id),
    kitchen_id: prepItemString(source.kitchen_id),
    name: prepItemString(source.name),
    slug: prepItemString(source.slug),
    description: prepItemString(source.description),
    source_language: prepItemString(source.source_language),
    names: normalizeKitchenPrepItemTranslatedText(source.names),
    descriptions: normalizeKitchenPrepItemTranslatedText(source.descriptions),
    station: prepItemString(source.station),
    inputs: Array.isArray(source.inputs)
      ? source.inputs.map(normalizeKitchenPrepItemInput)
      : [],
    recipe_id: prepItemString(source.recipe_id),
    yield: {
      quantity: prepItemQuantity(yieldValue.quantity),
      unit: normalizeKitchenPrepItemUnit(yieldValue.unit),
    },
    method: Array.isArray(source.method)
      ? source.method.map(prepItemString).filter(Boolean)
      : [],
    created: Object.keys(created).length
      ? (created as unknown as KitchenPrepItem['created'])
      : KitchenPrepItemDefaults.created,
    updated: Object.keys(updated).length
      ? (updated as unknown as KitchenPrepItem['updated'])
      : KitchenPrepItemDefaults.updated,
  }
}
