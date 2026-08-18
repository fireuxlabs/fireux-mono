import { computed, type Ref } from 'vue'
import type { Ingredient } from '../models/ingredient.model.ts'

export function useIngredientComputed(
  ingredient?: Ref<Ingredient | null | undefined>
) {
  const hasIngredient = computed(() => Boolean(ingredient?.value?.id))
  const hasMissingName = computed(() =>
    !String(ingredient?.value?.name || '').trim()
  )
  const hasMissingSlug = computed(() =>
    !String(ingredient?.value?.slug || '').trim()
  )
  const displayName = computed(() =>
    String(
      ingredient?.value?.name ||
        ingredient?.value?.slug ||
        ingredient?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(ingredient?.value?.image_url || '').trim()
  )

  return {
    hasIngredient,
    hasMissingName,
    hasMissingSlug,
    displayName,
    displayImageUrl,
  }
}
