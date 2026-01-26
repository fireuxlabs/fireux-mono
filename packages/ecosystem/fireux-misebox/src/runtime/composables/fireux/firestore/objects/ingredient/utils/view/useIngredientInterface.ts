import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Ingredient } from '../../../../../../../models/objects/Ingredient.model'

export namespace IngredientCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    title: string
    subtitle: string

    name: string
    category: string

    // Status/label chips
    badges: string[]
  }
}

export function useIngredientInterface() {
  function map(ingredient: Ingredient): IngredientCard.Card {
    const id = safeString(ingredient.id).trim()
    const name = safeString(ingredient.name)
    const category = safeString(ingredient.category)

    return {
      id,
      to: id ? `/ingredients/${id}` : '',

      avatarUrl: '',
      title: name,
      subtitle: category,

      name,
      category,

      badges: [],
    }
  }

  function card(target?: Ingredient | null | undefined): IngredientCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(ingredient: Ingredient): string {
    const name = safeString(ingredient.name)
    const category = safeString(ingredient.category)
    const id = safeString(ingredient.id)
    return `${name} ${category} ${id}`.trim().toLowerCase()
  }

  return { card, searchText }
}
