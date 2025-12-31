import type { Recipe } from '../../../../../../../models/objects/Recipe.model.ts'

export namespace RecipeCard {
  export interface Pill {
    slug?: string
    title: string
    subtitle?: string | null
  }

  export interface Cell extends Pill {
    status?: string | null
  }

  export type Profile = Recipe
}

export function useRecipeInterface() {
  const pillProps = (recipe?: Recipe | null): RecipeCard.Pill => ({
    slug: recipe?.slug,
    title: recipe?.title || 'Recipe',
    subtitle: recipe?.chef_name ?? null,
  })

  const cellProps = (recipe?: Recipe | null): RecipeCard.Cell => {
    const pill = pillProps(recipe)
    return {
      ...pill,
      status: recipe?.status ?? null,
    }
  }

  return { pillProps, cellProps }
}
