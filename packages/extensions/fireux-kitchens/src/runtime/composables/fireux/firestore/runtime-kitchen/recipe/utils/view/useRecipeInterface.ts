import { safeString, safeStringArray } from 'fireux-core/runtime/composables/shared/useInterfaceUtils'
import type { Recipe } from '../../../../../../../models/recipe.model'

export namespace RecipeCard {
  export type Card = {
    id: string
    to: string
    avatarUrl: string
    subtitle: string
    title: string
    status: string
    badges: string[]
    prop?: string
  }
}

const EMPTY_CARD: RecipeCard.Card = {
  id: '',
  to: '',
  avatarUrl: '',
  subtitle: '',
  title: '',
  status: '',
  badges: [],
  prop: '',
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
    const badges = [status, protection === 'standard' ? '' : protection].filter(Boolean)

    return {
      id,
      to: id ? `/console/kitchen/recipes?recipe=${encodeURIComponent(id)}` : '',
      avatarUrl: safeString(recipe.published_summary?.hero_image_url).trim(),
      subtitle,
      title,
      status,
      badges,
      prop: safeString(recipe.description).trim(),
    }
  }

  function card(target?: Recipe | null | undefined): RecipeCard.Card | null {
    if (!target) return null
    return map(target)
  }

  function pillProps(target?: Recipe | null | undefined): RecipeCard.Card {
    return target ? map(target) : EMPTY_CARD
  }

  function searchText(recipe: Recipe): string {
    const mapped = map(recipe)
    return [
      mapped.title,
      mapped.status,
      mapped.subtitle,
      safeStringArray(recipe.tags).join(' '),
      safeString(recipe.id).trim(),
      safeString(recipe.slug).trim(),
    ]
      .join(' ')
      .trim()
      .toLowerCase()
  }

  return { card, pillProps, searchText }
}