import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleOverview } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleOverview'
import type { Property } from '../../../../models/property.model'
import { usePropertyConsole } from './usePropertyConsole'

export function usePropertyConsoleOverview() {
  const {
    liveProperties,
    demoProperties,
    testProperty,
    selectedProperty,
    selectedMode,
    propertyId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
  } = usePropertyConsole()

  const overview = useConsoleOverview<Property, Property>({
    selectedEntity: selectedProperty,
    selectedMode,
    liveItems: liveProperties,
    demoItems: demoProperties,
    testItem: testProperty,
    getId: (property) => normalizeString(property?.id),
  })
  const debug = computed(() => ({
    mode: selectedMode.value,
    propertyId: propertyId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    focus: overview.focus.value,
    group: {
      count: overview.group.value.count,
      ids: overview.group.value.items.map((item) => normalizeString(item?.id)),
    },
  }))

  return {
    ...overview,
    selectedProperty,
    selectedMode,
    propertyId,
    rootCollection,
    canWrite,
    clearSelectedProperty,
    debug,
  }
}
