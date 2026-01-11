
import type { Ingredient } from '../../packages/ecosystem/fireux-misebox/src/runtime/models/objects/Ingredient.model'

export namespace IngredientCard {
  export type Card = {
    id: string
    to: string

    name: string
    category: string

    badges: string[]
  }
}

export function useIngredientInterface() {
  function map(ingredient: Ingredient): IngredientCard.Card {
    return {
      id: ingredient.id,
      to: `/ingredients/${ingredient.id}`,

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
