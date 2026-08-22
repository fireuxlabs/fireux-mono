import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type KitchenPrepItemTranslatedText = Partial<Record<string, string>>
export type KitchenPrepItemUnit = 'g' | 'ml' | 'each' | 'portion' | ''

export type KitchenPrepItemInput = {
  ingredient_id: string
  quantity: number
  unit: KitchenPrepItemUnit
  preparation: string
}

export type KitchenPrepItemYield = {
  quantity: number
  unit: KitchenPrepItemUnit
}

export type KitchenPrepItem = FireuxStamped & {
  id: string
  kitchen_id: string
  name: string
  slug: string
  description: string
  source_language: string
  names: KitchenPrepItemTranslatedText
  descriptions: KitchenPrepItemTranslatedText
  station: string
  inputs: KitchenPrepItemInput[]
  recipe_id: string
  yield: KitchenPrepItemYield
  method: string[]
}
