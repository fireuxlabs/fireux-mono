import {
  safeString,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Recipe } from '../../../../../../models/recipe.model'

export namespace RecipeCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    imageUrl: string
    subtitle: string
    meta: string
    title: string
    status: string
    badges: string[]
    summary: string
    prop?: string
  }
}

export function useRecipeInterface() {
  function map(recipe: Recipe): RecipeCard.Card {
    const id = safeString(recipe.id).trim()
    const title = safeString(recipe.name).trim()
    const summary = safeString(recipe.description).trim()

    return {
      id,
      to: `/console/kitchen/recipes/${encodeURIComponent(id)}`,
      avatarUrl: '',
      imageUrl: '',
      subtitle: summary,
      meta: summary,
      title,
      status: '',
      badges: [],
      summary,
      prop: summary,
    }
  }

  function buildInterface(
    target?: Recipe | null | undefined
  ): RecipeCard.Card | null {
    if (!target) return null
    return map(target)
  }

  const toInterface = buildInterface

  function pill(target?: Recipe | null | undefined): RecipeCard.Card | null {
    return buildInterface(target)
  }

  function cell(target?: Recipe | null | undefined): RecipeCard.Card | null {
    return buildInterface(target)
  }

  function preview(target?: Recipe | null | undefined): RecipeCard.Card | null {
    return buildInterface(target)
  }

  function profile(target?: Recipe | null | undefined): RecipeCard.Card | null {
    return buildInterface(target)
  }

  return { interface: toInterface, pill, cell, preview, profile }
}
