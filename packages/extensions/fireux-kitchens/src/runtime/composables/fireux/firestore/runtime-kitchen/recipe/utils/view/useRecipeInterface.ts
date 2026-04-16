import {
  safeString,
  safeStringArray,
} from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Recipe } from '../../../../../../../models/recipe.model'

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
    const slug = safeString(recipe.slug).trim()
    const title =
      safeString(recipe.published_summary?.title).trim() ||
      safeString(recipe.name).trim() ||
      'Untitled recipe'
    const status = safeString(recipe.workflow_status).trim() || 'draft'
    const visibility = safeString(recipe.visibility).trim()
    const protection = safeString(recipe.protection_level).trim()
    const recipeType = safeString(recipe.recipe_type).trim()
    const subtitle = [recipeType, visibility].filter(Boolean).join(' · ')
    const badges = [status, protection === 'standard' ? '' : protection].filter(
      Boolean
    )

    return {
      id,
      to: id ? `/console/kitchen/recipes?recipe=${encodeURIComponent(id)}` : '',
      avatarUrl: safeString(recipe.published_summary?.hero_image_url).trim(),
      imageUrl: safeString(recipe.published_summary?.hero_image_url).trim(),
      subtitle,
      meta: subtitle,
      title,
      status,
      badges,
      summary: safeString(recipe.description).trim(),
      prop: safeString(recipe.description).trim(),
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
