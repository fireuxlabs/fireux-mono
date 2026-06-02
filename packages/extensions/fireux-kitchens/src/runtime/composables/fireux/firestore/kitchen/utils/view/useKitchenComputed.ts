import { computed, type Ref } from 'vue'
import type { Kitchen } from '../../../../../../models/kitchen.model'

export function useKitchenComputed(
  kitchen?: Ref<Partial<Kitchen> | null | undefined>
) {
  const hasKitchen = computed(() => Boolean(kitchen?.value?.id))
  const hasMissingName = computed(() =>
    !String(kitchen?.value?.name || '').trim()
  )
  const hasMissingSlug = computed(() =>
    !String(kitchen?.value?.slug || '').trim()
  )
  const isPublic = computed(() => kitchen?.value?.show === true)
  const isHidden = computed(() => kitchen?.value?.show === false)
  const isTestKitchen = computed(() => kitchen?.value?.is_test_kitchen === true)
  const displayStatus = computed(() =>
    isPublic.value ? 'Public' : isHidden.value ? 'Hidden' : 'Unknown'
  )
  const displayName = computed(() =>
    String(
      kitchen?.value?.name ||
        kitchen?.value?.short_name ||
        kitchen?.value?.slug ||
        kitchen?.value?.id ||
        ''
    ).trim()
  )
  const displayImageUrl = computed(() =>
    String(kitchen?.value?.image_url || '').trim()
  )
  const hasAddress = computed(() =>
    Boolean(
      String(
        kitchen?.value?.short_address ||
          kitchen?.value?.formatted_address ||
          ''
      ).trim()
    )
  )

  return {
    hasKitchen,
    hasMissingName,
    hasMissingSlug,
    isPublic,
    isHidden,
    isTestKitchen,
    displayStatus,
    displayName,
    displayImageUrl,
    hasAddress,
  }
}
