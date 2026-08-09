import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Recipe } from '../../../models/kitchen/recipe.model'

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

  function buildInterface(target?: Recipe | null): RecipeCard.Card | null {
    return target ? map(target) : null
  }

  return {
    interface: buildInterface,
    pill: buildInterface,
    cell: buildInterface,
    preview: buildInterface,
    profile: buildInterface,
  }
}
