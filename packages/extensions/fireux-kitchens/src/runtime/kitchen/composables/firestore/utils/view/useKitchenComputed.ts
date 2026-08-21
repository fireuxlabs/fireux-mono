import { computed, type Ref } from 'vue'
import type { Kitchen } from '../../../../models/kitchen.model.ts'
import {
  readKitchenVisibility,
} from '../../../../utils/kitchen-readers'
import { readKitchenPresentationIdentity } from '../../../../utils/kitchen-presentation'

export function useKitchenComputed(
  kitchen?: Ref<Partial<Kitchen> | null | undefined>
) {
  const view = computed(
    () =>
      kitchen?.value as
        | (Partial<Kitchen> & Record<string, unknown>)
        | null
        | undefined
  )
  const hasKitchen = computed(() => Boolean(kitchen?.value?.id))
  const identity = computed(() => readKitchenPresentationIdentity(view.value))
  const visibility = computed(() => readKitchenVisibility(view.value))
  const hasMissingName = computed(
    () => !String(identity.value.displayName || view.value?.name || '').trim()
  )
  const hasMissingSlug = computed(
    () => !String(kitchen?.value?.slug || '').trim()
  )
  const isVisible = computed(() => visibility.value)
  const isHidden = computed(() => !visibility.value)
  const displayStatus = computed(() => (isVisible.value ? 'Visible' : 'Hidden'))
  const displayName = computed(() =>
    String(
      identity.value.displayName ||
        view.value?.display_name ||
        view.value?.name ||
        view.value?.short_name ||
        kitchen?.value?.slug ||
        kitchen?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(identity.value.imageUrl || view.value?.image_url || '').trim()
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
