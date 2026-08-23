// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Property target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export function usePropertyWorkspaceOverview() {
  const { properties, selection, runtime, actions } = usePropertyWorkspace()

  const focus = computed(() => ({
    entity: selection.property.value,
    id: normalizeString(selection.property.value?.id),
    hasSelection: Boolean(selection.property.value),
    outcome: properties.outcome.value,
  }))
  const multiple = computed(() => ({
    items: properties.targets.value,
    count: properties.count.value,
    hasItems: properties.count.value > 0,
    outcome: properties.outcome.value,
  }))
  const debug = computed(() => ({
    propertyId: selection.propertyId.value,
    activePropertyAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: focus.value,
    multiple: {
      count: multiple.value.count,
      ids: multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    focus,
    multiple,
    outcome: properties.outcome,
    selectedProperty: selection.property,
    propertyId: selection.propertyId,
    activePropertyAppId: runtime.appId,
    rootCollection: runtime.rootCollection,
    readOnly: runtime.readOnly,
    canWrite: runtime.canWrite,
    clearSelectedProperty: actions.clearSelectedProperty,
    debug,
  }
}
