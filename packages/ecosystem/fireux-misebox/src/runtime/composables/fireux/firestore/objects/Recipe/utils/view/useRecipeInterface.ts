import type { Recipe } from '../../../../../../../models/objects/Recipe.model'

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
      id: recipe.slug,
      to: `/recipes/${recipe.slug}`,

      title: recipe.title,
      status: String(recipe.status ?? ''),

      badges: [],
    }
  }

  function card(target?: Recipe | null | undefined): RecipeCard.Card | null {
    return target ? map(target) : null
  }

  function searchText(recipe: Recipe): string {
    return `${recipe.title} ${recipe.status ?? ''} ${recipe.slug}`.toLowerCase()
  }

  return { card, searchText }
}
