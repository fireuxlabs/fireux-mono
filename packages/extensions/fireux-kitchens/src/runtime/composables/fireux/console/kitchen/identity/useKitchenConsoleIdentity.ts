// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: expose Kitchen identity without treating legacy Kitchen currency as shared truth.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenConsole } from '../core/useKitchenConsole'
import {
  readKitchenIdentity,
} from '../../../../../utils/kitchen-spine'

export function useKitchenConsoleIdentity() {
  const {
    selection,
    runtime,
    actions,
  } = useKitchenConsole()
  const selectedConsoleKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const appId = runtime.appId
  const source = runtime.source
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const selectedKitchen = computed(() => selectedConsoleKitchen.value)
  const kitchenRecord = computed(
    () => selectedKitchen.value as Record<string, unknown> | null
  )
  const identity = computed(() => readKitchenIdentity(kitchenRecord.value))

  const name = computed(() =>
    normalizeString(identity.value.displayName)
  )
  const tagline = computed(() =>
    normalizeString(identity.value.tagline)
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
    appId: appId.value,
    rootCollection: rootCollection.value,
    readOnly: readOnly.value,
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
    kitchenId,
    appId,
    rootCollection,
    source,
    readOnly,
    canWrite,
    clearSelectedKitchen: actions.clearSelectedKitchen,
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
