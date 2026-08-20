import type { Dish } from './dish.model.ts'

export type KitchenOperationSuggestion = {
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
export function buildMissingDrinkImageSuggestions(
  drinks: readonly Dish[],
  limit = 5
): KitchenOperationSuggestion[] {
  const boundedLimit = Math.max(0, Math.min(5, Math.floor(limit)))
  const missing = drinks.filter(
    (drink) => drink.item_kind === 'drink' && !clean(drink.image)
  )

  if (!missing.length || !boundedLimit) return []

  const previewNames = missing
    .slice(0, Math.min(3, boundedLimit))
    .map((drink) => clean(drink.name) || 'an untitled drink')
  const remainingCount = missing.length - previewNames.length
  const affectedLabel = [
    previewNames.join(', '),
    remainingCount > 0 ? `and ${remainingCount} more` : '',
  ]
    .filter(Boolean)
    .join(' ')

  return [
    {
      id: 'drinks-missing-images',
      title: `${missing.length === 1 ? 'Add an image' : 'Add images'} to ${affectedLabel}`,
      description: `${missing.length} ${missing.length === 1 ? 'drink has' : 'drinks have'} no image. Use Update drink for each one.`,
      evidence: `${missing.length} Drink.image ${missing.length === 1 ? 'field is' : 'fields are'} empty`,
      toolId: 'kitchen.drinks.update-drink',
      affectedCount: missing.length,
    },
  ]
}
