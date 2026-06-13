import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenConsole } from '../core/useKitchenConsole'

export function useKitchenConsoleIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = useKitchenConsole()
  const selectedConsoleKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const selectedKitchen = computed(() => selectedConsoleKitchen.value)
  const kitchenRecord = computed(
    () => selectedKitchen.value as Record<string, unknown> | null
  )

  const name = computed(() =>
    normalizeString(kitchenRecord.value?.display_name || kitchenRecord.value?.name)
  )
  const tagline = computed(() =>
    normalizeString(kitchenRecord.value?.tagline)
  )
  const currencyCode = computed(() =>
    normalizeString(kitchenRecord.value?.default_currency_code) || 'CHF'
  )
  const slug = computed(() =>
    normalizeString(kitchenRecord.value?.slug)
  )
  const placeId = computed(() =>
    normalizeString(kitchenRecord.value?.place_id)
  )
  const address = computed(() => {
    const kitchen = kitchenRecord.value
    return normalizeString(kitchen?.short_address || kitchen?.formatted_address)
  })
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    rootCollection: rootCollection.value,
    readOnly: readOnly.value,
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
    kitchenId,
    rootCollection,
    readOnly,
    canWrite,
    clearSelectedKitchen: actions.clearSelectedKitchen,
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
