import type { RecipePreparation } from './recipe-preparation'
import type { FireuxStamped } from 'fireux-core/runtime/models/utils/stamps.model'

export type RecipeTranslatedText = Partial<Record<string, string>>

export type Recipe = FireuxStamped & {
  context?: string
  id: string
  name: string
  slug: string
  description: string
  source_language: string
  names: RecipeTranslatedText
  descriptions: RecipeTranslatedText
  kitchen_id: string
  preparation?: RecipePreparation
}
