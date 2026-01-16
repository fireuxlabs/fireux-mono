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
    return {
      id: ingredient.id,
      to: `/ingredients/${ingredient.id}`,

      avatarUrl: '',
      title: ingredient.name,
      subtitle: ingredient.category ?? '',

      name: ingredient.name,
      category: ingredient.category ?? '',

      badges: [],
    }
  }

  function card(target?: Ingredient | null | undefined): IngredientCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(ingredient: Ingredient): string {
    return `${ingredient.name} ${ingredient.category ?? ''} ${ingredient.id}`
      .toLowerCase()
  }

  return { card, searchText }
}
