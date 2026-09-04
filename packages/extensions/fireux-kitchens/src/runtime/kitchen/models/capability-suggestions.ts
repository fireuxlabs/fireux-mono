import type { Dish } from './dish.model.ts'
import type { Recipe } from './recipe.model.ts'
import type { KitchenStation } from './station.model.ts'

export type KitchenCapabilitySuggestion = {
  id: string
  title: string
  description: string
  evidence: string
  toolId: `kitchen.${string}.${string}`
  affectedCount?: number
  actionLabel?: string
  actionPath?: string
}

const clean = (value: unknown) => String(value ?? '').trim()

/**
 * Suggestions are projections of current records and usable tools. They do not
 * invent missing state or execute a mutation without an operator.
 */
function buildMissingImageSuggestions(
  records: readonly Dish[],
  options: {
    id: string
    itemKind: Dish['item_kind']
    singular: 'dish' | 'drink'
    plural: 'dishes' | 'drinks'
    toolId: `kitchen.${string}.${string}`
  },
  limit = 5
): KitchenCapabilitySuggestion[] {
  const boundedLimit = Math.max(0, Math.min(5, Math.floor(limit)))
  const missing = records.filter(
    (record) => record.item_kind === options.itemKind && !clean(record.image)
  )

  if (!missing.length || !boundedLimit) return []

  const previewNames = missing
    .slice(0, Math.min(3, boundedLimit))
    .map((record) => clean(record.name) || `an untitled ${options.singular}`)
  const remainingCount = missing.length - previewNames.length
  const affectedLabel = [
    previewNames.join(', '),
    remainingCount > 0 ? `and ${remainingCount} more` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return [
    {
      id: options.id,
      title: `${missing.length === 1 ? 'Add an image' : 'Add images'} to ${affectedLabel}`,
      description: `${missing.length} ${missing.length === 1 ? `${options.singular} has` : `${options.plural} have`} no image. Use Update ${options.singular} for each one.`,
      evidence: `${missing.length} ${options.singular === 'dish' ? 'Dish' : 'Drink'}.image ${missing.length === 1 ? 'field is' : 'fields are'} empty`,
      toolId: options.toolId,
      affectedCount: missing.length,
    },
  ]
}

export function buildMissingDishImageSuggestions(
  dishes: readonly Dish[],
  limit = 5
) {
  return buildMissingImageSuggestions(
    dishes,
    {
      id: 'dishes-missing-images',
      itemKind: 'food',
      singular: 'dish',
      plural: 'dishes',
      toolId: 'kitchen.dishes.update-dish',
    },
    limit
  )
}

export function buildMissingDrinkImageSuggestions(
  drinks: readonly Dish[],
  limit = 5
) {
  return buildMissingImageSuggestions(
    drinks,
    {
      id: 'drinks-missing-images',
      itemKind: 'drink',
      singular: 'drink',
      plural: 'drinks',
      toolId: 'kitchen.drinks.update-drink',
    },
    limit
  )
}

export function buildMissingRecipeDescriptionSuggestions(
  recipes: readonly Recipe[],
  limit = 5
): KitchenCapabilitySuggestion[] {
  const boundedLimit = Math.max(0, Math.min(5, Math.floor(limit)))
  const missing = recipes.filter((recipe) => !clean(recipe.description))
  if (!missing.length || !boundedLimit) return []

  const names = missing
    .slice(0, Math.min(3, boundedLimit))
    .map((recipe) => clean(recipe.name) || 'an untitled recipe')
  const remainingCount = missing.length - names.length
  const affectedLabel = [
    names.join(', '),
    remainingCount > 0 ? `and ${remainingCount} more` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return [
    {
      id: 'recipes-missing-descriptions',
      title: `Add ${missing.length === 1 ? 'a description' : 'descriptions'} to ${affectedLabel}`,
      description: `${missing.length} ${missing.length === 1 ? 'Recipe has' : 'Recipes have'} no description. Use Update Recipe for each one.`,
      evidence: `${missing.length} Recipe.description ${missing.length === 1 ? 'field is' : 'fields are'} empty`,
      toolId: 'kitchen.recipes.update-recipe',
      affectedCount: missing.length,
    },
  ]
}

export function buildStationSetupSuggestions(
  stations: readonly KitchenStation[]
): KitchenCapabilitySuggestion[] {
  if (stations.length) return []

  return [
    {
      id: 'stations-empty',
      title: 'Add your first Station',
      description:
        'No Station records exist for this Kitchen. Add one named production destination when you are ready.',
      evidence: 'The selected Kitchen has 0 Kitchen Station records',
      toolId: 'kitchen.stations.create-station',
      affectedCount: 0,
    },
  ]
}
