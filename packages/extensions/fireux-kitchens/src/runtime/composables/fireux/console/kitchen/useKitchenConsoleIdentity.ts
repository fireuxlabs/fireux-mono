import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { KitchenStorage } from '../../../../models/kitchen.model'
import { useKitchenFetch } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenConsole } from './useKitchenConsole'

export function useKitchenConsoleIdentity() {
  const {
    selectedKitchen: selectedConsoleKitchen,
    selectedMode,
    kitchenId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } = useKitchenConsole()
  const { kitchen: selectedKitchenDoc } = useKitchenFetch(kitchenId, {
    source: selectedMode,
    collectionPath: KitchenStorage.rootCollection,
  })
  const selectedKitchen = computed(
    () => selectedKitchenDoc.value ?? selectedConsoleKitchen.value
  )

  const name = computed(() =>
    normalizeString(
      (selectedKitchen.value as Record<string, unknown> | null)?.display_name ||
        selectedKitchen.value?.name
    )
  )
  const tagline = computed(() =>
    normalizeString((selectedKitchen.value as Record<string, unknown> | null)?.tagline)
  )
  const currencyCode = computed(() =>
    normalizeString(
      (selectedKitchen.value as Record<string, unknown> | null)?.default_currency_code
    ) || 'CHF'
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
    selectedMode: selectedMode.value,
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    name: name.value,
    tagline: tagline.value,
    currencyCode: currencyCode.value,
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
    currencyCode,
    slug,
    placeId,
    address,
    debug,
  }
}

export type KitchenConsoleIdentityState = ReturnType<
  typeof useKitchenConsoleIdentity
>
