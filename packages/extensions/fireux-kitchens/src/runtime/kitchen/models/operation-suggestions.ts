import type { Dish } from './dish.model.ts'

export type KitchenOperationSuggestion = {
  id: string
  title: string
  description: string
  evidence: string
  toolId: `kitchen.${string}.${string}`
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

  return drinks
    .filter((drink) => drink.item_kind === 'drink' && !clean(drink.image))
    .slice(0, boundedLimit)
    .map((drink) => {
      const name = clean(drink.name) || 'Untitled drink'

      return {
        id: `drink-missing-image:${drink.id}`,
        title: `Add an image to ${name}`,
        description: 'This drink has no image, so its collection card cannot show it.',
        evidence: 'Drink.image is empty',
        toolId: 'kitchen.drinks.update-image',
        actionLabel: 'Open drink',
        actionPath: drink.id
          ? `/console/kitchen/drinks/${encodeURIComponent(drink.id)}`
          : undefined,
      }
    })
}
