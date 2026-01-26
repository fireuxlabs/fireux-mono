import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Recipe } from '../../../../../../../models/objects/Recipe.model'

export namespace RecipeCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string

    // Primary display fields
    subtitle: string

    title: string
    status: string

    // Status/label chips
    badges: string[]
  }
}

export function useRecipeInterface() {
  function map(recipe: Recipe): RecipeCard.Card {
    const status = safeString(recipe.status ?? '')
    const id = safeString(recipe.slug).trim()
    const title = safeString(recipe.title)

    return {
      id,
      to: id ? `/recipes/${id}` : '',

      avatarUrl: '',
      subtitle: status,

      title,
      status,

      badges: [],
    }
  }

  function card(target?: Recipe | null | undefined): RecipeCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

  function searchText(recipe: Recipe): string {
    const title = safeString(recipe.title)
    const status = safeString(recipe.status ?? '')
    const slug = safeString(recipe.slug)
    return `${title} ${status} ${slug}`.trim().toLowerCase()
  }

  return { card, searchText }
}
