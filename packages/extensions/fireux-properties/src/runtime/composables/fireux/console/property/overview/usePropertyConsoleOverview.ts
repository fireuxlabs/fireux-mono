import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import type { Property } from '../../../../../models/property.model'
import { usePropertyConsole } from '../core/usePropertyConsole'

export function usePropertyConsoleOverview() {
  const {
    targetProperties,
    selectedProperty,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
  } = usePropertyConsole()

  const overview = useConsoleOverview<Property>({
    selectedEntity: selectedProperty,
    targetItems: targetProperties,
    getId: (property) => normalizeString(property?.id),
  })
  const debug = computed(() => ({
    propertyId: propertyId.value,
    activePropertyAppId: activePropertyAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    multiple: {
      count: overview.multiple.value.count,
      ids: overview.multiple.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedProperty,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
    debug,
  }
}
