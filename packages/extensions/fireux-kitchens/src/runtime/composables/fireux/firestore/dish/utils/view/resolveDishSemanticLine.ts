import type { Ingredient } from '../../../../../../models/ingredient.model'
import type { Recipe } from '../../../../../../models/recipe.model'
import type { Dish } from '../../../../../../models/dish.model'

type SemanticSource = Pick<Recipe | Ingredient, 'id' | 'name' | 'names'>

export type ResolveDishSemanticLineInput = {
  dish: Pick<Dish, 'recipe_ids' | 'ingredient_ids'> | null | undefined
  recipes?: SemanticSource[]
  ingredients?: SemanticSource[]
  languageCode?: string
  excludedIds?: string[]
  excludedTerms?: string[]
}

const normalizeString = (value: unknown) => String(value ?? '').trim()
const normalizeLanguageCode = (value: unknown) =>
  normalizeString(value).replace(/_/g, '-')
const normalizeComparable = (value: unknown) =>
  normalizeString(value)
    .toLowerCase()
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const normalizeIdList = (value: unknown) =>
  Array.isArray(value)
    ? Array.from(new Set(value.map((entry) => normalizeString(entry)).filter(Boolean)))
    : []

const sourceName = (source: SemanticSource, languageCode: string) => {
  const localized = source.names?.[languageCode]
  return normalizeString(localized) || normalizeString(source.name)
}

const sourceMap = (sources: SemanticSource[] = []) => {
  const map = new Map<string, SemanticSource>()
  sources.forEach((source) => {
    const id = normalizeString(source.id)
    if (id) map.set(id, source)
  })
  return map
}

export function resolveDishSemanticLine(input: ResolveDishSemanticLineInput) {
  const dish = input.dish
  if (!dish) return ''

  const languageCode = normalizeLanguageCode(input.languageCode) || 'en'
  const excludedIds = new Set(normalizeIdList(input.excludedIds))
  const excludedTerms = new Set(
    normalizeIdList(input.excludedTerms).map((term) => normalizeComparable(term))
  )
  const recipesById = sourceMap(input.recipes)
  const ingredientsById = sourceMap(input.ingredients)

  const names: string[] = []
  const pushSource = (id: string, source: SemanticSource | undefined) => {
    if (!source || excludedIds.has(id)) return

    const name = sourceName(source, languageCode)
    if (!name || excludedTerms.has(normalizeComparable(name))) return
    names.push(name)
  }

  normalizeIdList(dish.recipe_ids).forEach((id) => {
    pushSource(id, recipesById.get(id))
  })
  normalizeIdList(dish.ingredient_ids).forEach((id) => {
    pushSource(id, ingredientsById.get(id))
  })

  return names.join(', ')
}
