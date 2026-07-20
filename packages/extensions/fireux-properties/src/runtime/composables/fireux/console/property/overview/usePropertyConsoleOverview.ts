// Concurrent edit — 2026-07-20 16:26 CEST — Console Spine pass: carry Property target outcome into overview.
import { computed } from 'vue'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import type { Property } from '../../../../../models/property.model'
import { usePropertyConsole } from '../core/usePropertyConsole'

export function usePropertyConsoleOverview() {
  const {
    properties,
    selection,
    runtime,
    actions,
  } = usePropertyConsole()

  const overview = useConsoleOverview<Property>({
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
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
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
