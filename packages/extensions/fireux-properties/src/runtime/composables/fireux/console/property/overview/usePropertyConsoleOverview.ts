import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import type { Property } from '../../../../../models/property.model'
import { usePropertyConsole } from '../core/usePropertyConsole'

export function usePropertyConsoleOverview() {
  const {
    liveProperties,
    demoProperties,
    testProperty,
    selectedProperty,
    selectedMode,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
  } = usePropertyConsole()

  const overview = useConsoleOverview<Property>({
    selectedEntity: selectedProperty,
    selectedMode,
    liveItems: liveProperties,
    demoItems: demoProperties,
    testItem: testProperty,
    getId: (property) => normalizeString(property?.id),
  })
  const debug = computed(() => ({
    selectedMode: selectedMode.value,
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
    selectedMode,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
    debug,
  }
}
