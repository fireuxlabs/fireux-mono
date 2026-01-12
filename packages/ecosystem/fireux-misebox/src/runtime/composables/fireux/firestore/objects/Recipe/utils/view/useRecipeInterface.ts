import type { Recipe } from '../../../../../../../models/objects/Recipe.model'

export namespace RecipeCard {
  export type Card = {
    id: string
    to: string

    // Canon pill fields
    avatarUrl: string
    subtitle: string

    title: string
    status: string

    badges: string[]
  }
}

export function useRecipeInterface() {
  function map(recipe: Recipe): RecipeCard.Card {
    const status = String(recipe.status ?? '')

    return {
      id: recipe.slug,
      to: `/recipes/${recipe.slug}`,

      avatarUrl: '',
      subtitle: status,

      title: recipe.title,
      status,

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
