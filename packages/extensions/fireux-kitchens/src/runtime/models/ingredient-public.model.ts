import type {
  IngredientCategory,
  IngredientKind,
  IngredientStatus,
} from './ingredient-taxonomy'

/**
 * Stable cross-console projection. Kitchen and Supplier operational records
 * carry only `ingredient_id`; display identity is hydrated through this shape.
 */
export type PublicIngredient = {
  id: string
  schema_version: 2
  slug: string
  name: string
  aliases: string[]
  category: IngredientCategory
  kind: IngredientKind
  status: IngredientStatus
  image_url: string
  parent_ingredient_id?: string
  replaced_by_ingredient_id?: string
}

export type PublicIngredientCollectionResponse = {
  items: PublicIngredient[]
}

export type PublicIngredientDetailResponse = {
  item: PublicIngredient
}
