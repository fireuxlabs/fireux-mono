// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: compose Property membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: consume Property core-owned target authority.
import { computed } from 'vue'
import { useWorkspaceIndex } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'
export function usePropertyWorkspaceIndex() {
  const {
    properties,
    targeting,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = usePropertyWorkspace()
  const selection = computed(() => ({
    property: workspaceSelection.property.value,
    propertyId: workspaceSelection.propertyId.value,
  }))
  const runtime = computed(() => ({
    appId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    propertyId: workspaceSelection.propertyId.value,
    activePropertyAppId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedProperty: workspaceSelection.property.value,
    targetCount: properties.count.value,
    source: targeting.debug.value,
  }))

  return useWorkspaceIndex({
    selection,
    selectedId: computed(() => workspaceSelection.propertyId.value),
    runtime,
    targets: properties.targets,
    outcome: properties.outcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    selectTarget: (id: string) => {
      workspaceActions.selectProperty(String(id ?? '').trim())
    },
    clearSelection: workspaceActions.clearSelectedProperty,
    debug,
  })
}
