// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: use outcome as target-state authority.
// Concurrent edit — 2026-07-20 16:27 CEST — Workspace Spine pass: compose Property membership outcome before selection validation and bind real target ids.
// Concurrent edit — 2026-07-21 22:31 CEST — Workspace family alignment: consume Property core-owned target authority.
import { computed } from 'vue'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'
export function usePropertyWorkspaceIndex() {
  const {
    properties,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = usePropertyWorkspace()
  const debug = computed(() => ({
    propertyId: workspaceSelection.propertyId.value,
    activePropertyAppId: workspaceRuntime.appId.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedProperty: workspaceSelection.property.value,
    targetCount: properties.count.value,
  }))

  return {
    property: workspaceSelection.property,
    propertyId: workspaceSelection.propertyId,
    properties: properties.targets,
    outcome: properties.outcome,
    selectProperty: workspaceActions.selectProperty,
    clearProperty: workspaceActions.clearSelectedProperty,
    debug,
  }
}
