import { safeString } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Recipe } from 'fireux-kitchens/runtime/models/recipe.model'

export namespace RecipeCard {
  export type Card = {
    id: string
    to: string

    // Media (empty string means unset)
    avatarUrl: string
    imageUrl: string

    // Primary display fields
    subtitle: string

    title: string
    summary: string
    status: string

    // Status/label chips
    badges: string[]
  }
}

export function useRecipeInterface() {
  function map(recipe: Recipe): RecipeCard.Card {
    const status = safeString(recipe.workflow_status).trim() || 'draft'
    const id = safeString(recipe.slug || recipe.id).trim()
    const title = safeString(recipe.published_summary?.title || recipe.name).trim() || 'Untitled Recipe'
    const subtitle = safeString(recipe.recipe_type).trim()
    const avatarUrl = safeString(recipe.published_summary?.hero_image_url).trim()
    const badges = [safeString(recipe.visibility).trim(), safeString(recipe.protection_level).trim()]
      .filter(Boolean)
      .filter((badge) => badge !== 'team' && badge !== 'standard')

    return {
      id,
      to: id ? `/recipes/${id}` : '',

      avatarUrl,
      imageUrl: avatarUrl,
      subtitle,

      title,
      summary: '',
      status,

      badges,
    }
  }

  function buildInterface(target?: Recipe | null | undefined): RecipeCard.Card | null {
    if (!target) return null
    const mapped = map(target)
    return mapped.id ? mapped : null
  }

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

  return { pill, cell, preview, profile }
}
