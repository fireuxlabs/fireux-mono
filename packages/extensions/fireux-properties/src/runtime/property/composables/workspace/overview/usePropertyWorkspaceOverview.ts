// Concurrent edit — 2026-07-20 16:26 CEST — Workspace Spine pass: carry Property target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useWorkspaceOverview } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceOverview'
import type { Property } from '../../../models/property.model.ts'
import { usePropertyWorkspace } from '../core/usePropertyWorkspace'

export function usePropertyWorkspaceOverview() {
  const { properties, selection, runtime, actions } = usePropertyWorkspace()

  const overview = useWorkspaceOverview<Property>({
    selectedEntity: selection.property,
    targetItems: properties.targets,
    targetOutcome: properties.outcome,
    getId: (property) => normalizeString(property?.id),
  })
  const debug = computed(() => ({
    propertyId: selection.propertyId.value,
    activePropertyAppId: runtime.appId.value,
    rootCollection: runtime.rootCollection.value,
    readOnly: runtime.readOnly.value,
    canWrite: runtime.canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) =>
        normalizeString(item?.id)
      ),
    },
  }))

  return {
    ...overview,
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
