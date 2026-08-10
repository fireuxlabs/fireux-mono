import { computed, type Ref } from 'vue'
import type { KitchenPrepItem } from '../../../models/kitchen/prep-item.model'

export function useKitchenPrepItemComputed(
  prepItem?: Ref<KitchenPrepItem | null | undefined>
) {
  const hasPrepItem = computed(() => Boolean(prepItem?.value?.id))
  const displayName = computed(() => String(
    prepItem?.value?.name || prepItem?.value?.slug || prepItem?.value?.id || ''
  ).trim())
  const displayDescription = computed(() =>
    String(prepItem?.value?.description || '').trim()
  )
  const hasProductionDefinition = computed(() => Boolean(
    prepItem?.value?.inputs.length ||
    prepItem?.value?.method.length ||
    prepItem?.value?.yield.quantity
  ))
  const ingredientIds = computed(() => Array.from(new Set(
    (prepItem?.value?.inputs ?? [])
      .map(input => input.ingredient_id)
      .filter(Boolean)
  )))

  return {
    hasPrepItem,
    displayName,
    displayDescription,
    hasProductionDefinition,
    ingredientIds,
  }
}
