import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'
import type { IngredientCategory, IngredientKind, IngredientStatus } from './ingredient-taxonomy'

export type Ingredient = FireuxStamped & {
  id: string
  schema_version: 2
  name: string
  aliases: string[]
  slug: string
  category: IngredientCategory
  kind: IngredientKind
  parent_ingredient_id?: string
  status: IngredientStatus
  replaced_by_ingredient_id?: string
  image_url: string
}
