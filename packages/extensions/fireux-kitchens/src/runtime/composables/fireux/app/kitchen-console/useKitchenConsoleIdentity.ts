import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/console/useConsole'
import { useKitchenConsole } from './useKitchenConsole'

export function useKitchenConsoleIdentity() {
  const {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } = useKitchenConsole()

  const name = computed(() => normalizeString(selectedKitchen.value?.name))
  const tagline = computed(() =>
    normalizeString((selectedKitchen.value as Record<string, unknown> | null)?.tagline)
  )
  const slug = computed(() =>
    normalizeString((selectedKitchen.value as Record<string, unknown> | null)?.slug)
  )
  const placeId = computed(() =>
    normalizeString((selectedKitchen.value as Record<string, unknown> | null)?.place_id)
  )
  const address = computed(() => {
    const kitchen = selectedKitchen.value as Record<string, unknown> | null
    return normalizeString(kitchen?.short_address || kitchen?.formatted_address)
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    tagline: tagline.value,
    slug: slug.value,
    placeId: placeId.value,
    address: address.value,
    selectedKitchen: selectedKitchen.value,
  }))

  return {
    selectedKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
    name,
    tagline,
    slug,
    placeId,
    address,
    debug,
  }
}

export type KitchenConsoleIdentityState = ReturnType<
  typeof useKitchenConsoleIdentity
>
