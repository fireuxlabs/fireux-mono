// Concurrent edit — 2026-07-20 21:35 CEST — Place-root authority pass: expose Kitchen identity without treating legacy Kitchen currency as shared truth.
// Concurrent edit — 2026-07-22 12:44 CEST — Kitchen palette console: expose a portable authoritative target refresh after trusted writes.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useKitchenConsole } from '../core/useKitchenConsole'
import {
  readKitchenIdentity,
} from '../../../../../utils/kitchen-spine'

type KitchenConsoleState = ReturnType<typeof useKitchenConsole>

export function useKitchenConsoleIdentity(
  kitchenConsole: KitchenConsoleState = useKitchenConsole()
) {
  const {
    targets,
    selection,
    runtime,
    actions,
  } = kitchenConsole
  const selectedConsoleKitchen = selection.kitchen
  const kitchenId = selection.kitchenId
  const rootCollection = runtime.rootCollection
  const appId = runtime.appId
  const dataType = runtime.dataType
  const isDemo = runtime.isDemo
  const readOnly = runtime.readOnly
  const canWrite = runtime.canWrite
  const refreshTargets: () => Promise<void> = async () => {
    await targets.refresh()
  }
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
    dataType,
    isDemo,
    readOnly,
    canWrite,
    refreshTargets,
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
