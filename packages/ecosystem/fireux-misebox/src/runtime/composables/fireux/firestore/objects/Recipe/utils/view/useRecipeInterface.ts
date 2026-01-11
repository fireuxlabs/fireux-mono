
import type { Recipe } from '../../packages/ecosystem/fireux-misebox/src/runtime/models/objects/Recipe.model'

export namespace RecipeCard {
  export type Card = {
    id: string
    to: string

    title: string
    status: string

    badges: string[]
  }
}

export function useRecipeInterface() {
  function map(recipe: Recipe): RecipeCard.Card {
    return {
      id: recipe.id,
      to: `/recipes/${recipe.id}`,

      title: recipe.title,
      status: String(recipe.status ?? ''),

      badges: [],
    }
  }

  function card(target?: Recipe | null | undefined): RecipeCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(recipe: Recipe): string {
    return `${recipe.title} ${recipe.status ?? ''} ${recipe.id}`.toLowerCase()
  }

  return { card, searchText }
}
