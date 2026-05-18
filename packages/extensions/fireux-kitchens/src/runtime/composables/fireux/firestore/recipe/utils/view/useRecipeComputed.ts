import { computed, type Ref } from 'vue'
import type { Recipe } from '../../../../../../models/recipe.model'

export function useRecipeComputed(recipe?: Ref<Recipe | null | undefined>) {
  const hasRecipe = computed(() => Boolean(recipe?.value?.id))
  const hasMissingName = computed(() =>
    !String(recipe?.value?.name || '').trim()
  )
  const hasMissingSlug = computed(() =>
    !String(recipe?.value?.slug || '').trim()
  )
  const hasDescription = computed(() =>
    Boolean(String(recipe?.value?.description || '').trim())
  )
  const displayName = computed(() =>
    String(
      recipe?.value?.name ||
        recipe?.value?.slug ||
        recipe?.value?.id ||
        ''
    ).trim()
  )
  const displayDescription = computed(() =>
    String(recipe?.value?.description || '').trim()
  )

  return {
    hasRecipe,
    hasMissingName,
    hasMissingSlug,
    hasDescription,
    displayName,
    displayDescription,
  }
}
