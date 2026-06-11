import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { Property } from '../../../../../models/property.model'
import type { PropertyCollectionFilter } from '../../../firestore/property/fetch/usePropertyCollection'
import { usePropertyConsole } from '../core/usePropertyConsole'
import type { Ref } from 'vue'

type UsePropertyConsoleIndexOptions = {
  filter?: PropertyCollectionFilter | Ref<PropertyCollectionFilter | null | undefined> | null
}

export function usePropertyConsoleIndex(
  options: UsePropertyConsoleIndexOptions = {}
) {
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
    selectProperty,
    clearSelectedProperty,
  } = usePropertyConsole({
    filter: options.filter,
  })

  const sourceProperties = computed(() => ({
    live: liveProperties.value,
    demo: demoProperties.value,
    test: testProperty.value,
  }))

  const consoleIndex = useConsoleIndex<Property, Property, Property>({
    entities: sourceProperties,
    selectEntity: selectProperty,
    getTestId: (property) => normalizeString(property.id),
    debug: computed(() => ({
      selectedMode: selectedMode.value,
      propertyId: propertyId.value,
      activePropertyAppId: activePropertyAppId.value,
      rootCollection: rootCollection.value,
      canWrite: canWrite.value,
      selectedProperty: selectedProperty.value,
      status: 'property console uses scaffold data until Firestore property fetch/create is wired',
    })),
  })
  const debug = consoleIndex.debug

  return {
    properties: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedProperty,
    selectedMode,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedProperty,
  }
}
