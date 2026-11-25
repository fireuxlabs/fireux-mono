import type { FireuxStamps } from 'fireux-core/runtime/models/utils/stamps.model'
import type { IngredientCategory } from './ingredient-taxonomy'

/** Canonical culinary identity. Supplier offers and Kitchen usage reference it. */
export type Ingredient = FireuxStamps & {
  id: string
  name: string
  slug: string
  aliases: string[]
  category: IngredientCategory
  image_url?: string
}
