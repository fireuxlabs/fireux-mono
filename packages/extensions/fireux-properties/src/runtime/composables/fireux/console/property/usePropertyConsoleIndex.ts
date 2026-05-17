import { computed } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Property } from '../../../../models/property.model'
import type { PropertyCollectionFilter } from '../../firestore/property/fetch/usePropertyCollection'
import { usePropertyConsole } from './usePropertyConsole'
import type { Ref } from 'vue'

type UsePropertyConsoleIndexOptions = {
  filter?: PropertyCollectionFilter | Ref<PropertyCollectionFilter | null | undefined> | null
}

export function usePropertyConsoleIndex(
  options: UsePropertyConsoleIndexOptions = {}
) {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const {
    liveProperties,
    demoProperties,
    testProperty,
    selectedProperty,
    selectedMode,
    propertyId,
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
    autoCreateTest: true,
    testCreateKey: userId,
    createTestEntity: async () => userId.value || null,
  })

  const debug = computed(() => ({
    mode: selectedMode.value,
    propertyId: propertyId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedProperty: selectedProperty.value,
    counts: {
      live: consoleIndex.entities.value.live.length,
      demo: consoleIndex.entities.value.demo.length,
      test: consoleIndex.entities.value.test ? 1 : 0,
    },
    status: 'property console uses scaffold data until Firestore property fetch/create is wired',
  }))

  return {
    state: consoleIndex.state,
    user: consoleIndex.user,
    properties: consoleIndex.entities,
    actions: consoleIndex.actions,
    selectedProperty,
    selectedMode,
    propertyId,
    rootCollection,
    canWrite,
    debug,
    clearSelectedProperty,
  }
}
