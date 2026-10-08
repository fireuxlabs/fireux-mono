import { computed, type Ref } from 'vue'
import type { KitchenSurface } from '../models/kitchen-interface.model'
import { readKitchenVisibility } from '../utils/kitchen-readers'

export function useKitchenComputed(
  kitchen?: Ref<KitchenSurface | null | undefined>
) {
  const view = computed(() => kitchen?.value)
  const hasKitchen = computed(() => Boolean(kitchen?.value?.id))
  const identity = computed(() => view.value?.presentation)
  const visibility = computed(() => readKitchenVisibility(view.value))
  const hasMissingName = computed(
    () => !String(identity.value?.display_name || '').trim()
  )
  const hasMissingSlug = computed(
    () => !String(kitchen?.value?.slug || '').trim()
  )
  const isVisible = computed(() => visibility.value)
  const isHidden = computed(() => !visibility.value)
  const displayStatus = computed(() => (isVisible.value ? 'Visible' : 'Hidden'))
  const displayName = computed(() =>
    String(identity.value?.display_name || '').trim()
  )
  const displayImageUrl = computed(() =>
    String(identity.value?.image_url || '').trim()
  )
  const hasAddress = computed(() =>
    Boolean(
      String(
        view.value?.short_address || view.value?.formatted_address || ''
      ).trim()
    )
  )

  return {
    hasKitchen,
    hasMissingName,
    hasMissingSlug,
    isVisible,
    isHidden,
    displayStatus,
    displayName,
    displayImageUrl,
    hasAddress,
  }
}
