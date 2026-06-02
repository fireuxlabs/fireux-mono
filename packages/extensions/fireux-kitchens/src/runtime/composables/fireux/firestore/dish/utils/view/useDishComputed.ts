import { computed, type Ref } from 'vue'
import type { Dish } from '../../../../../../models/dish.model'

export function useDishComputed(dish?: Ref<Dish | null | undefined>) {
  const hasDish = computed(() => Boolean(dish?.value?.id))
  const hasMissingName = computed(() =>
    !String(dish?.value?.name || '').trim()
  )
  const hasMissingSlug = computed(() =>
    !String(dish?.value?.slug || '').trim()
  )
  const hasDescription = computed(() =>
    Boolean(String(dish?.value?.description || '').trim())
  )
  const displayName = computed(() =>
    String(
      dish?.value?.name ||
        dish?.value?.slug ||
        dish?.value?.id ||
        ''
    ).trim()
  )
  const displayDescription = computed(() =>
    String(dish?.value?.description || '').trim()
  )

  return {
    hasDish,
    hasMissingName,
    hasMissingSlug,
    hasDescription,
    displayName,
    displayDescription,
  }
}
