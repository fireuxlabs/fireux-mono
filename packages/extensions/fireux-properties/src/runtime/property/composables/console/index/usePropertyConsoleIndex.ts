// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Console Spine pass: compose Property membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Console family alignment: consume Property core-owned target authority.
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/console/useConsoleIndex'
import { usePropertyConsole } from '../core/usePropertyConsole'
export function usePropertyConsoleIndex() {
  const {
    properties,
    targeting,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = usePropertyConsole()
  const selection = computed(() => ({
    property: consoleSelection.property.value,
    propertyId: consoleSelection.propertyId.value,
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    propertyId: consoleSelection.propertyId.value,
    activePropertyAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedProperty: consoleSelection.property.value,
    targetCount: properties.count.value,
    source: targeting.debug.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.propertyId.value),
    runtime,
    targets: properties.targets,
    outcome: properties.outcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      consoleActions.selectProperty(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedProperty,
    debug,
  })
}
