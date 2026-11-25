import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'

export type RecipeInput = {
  kind: 'ingredient' | 'preparation'
  reference_id: string
  quantity: number
  unit: string
  note?: string
}

/** Authored production instructions and expected yield, never actual stock. */
export type Recipe = {
  id: string
  name: string
  description?: string
  output_preparation_id?: string
  yield?: { quantity: number; unit: string }
  inputs: RecipeInput[]
  method: string[]
  source?: { title: string; url: string }
  created?: FireuxStamps['created']
  updated?: FireuxStamps['updated']
}
