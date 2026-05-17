import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { Property } from '../../../../models/property.model'
import {
  usePropertyCollection,
  type PropertyCollectionFilter,
} from '../../firestore/property/fetch/usePropertyCollection'

export function usePropertyConsoleIndex() {
  const { uid } = useAuth()
  const userId = computed(() => normalizeString(uid.value))
  const liveFilter = computed<PropertyCollectionFilter>(() =>
    userId.value ? { operatorId: userId.value } : { ids: [] }
  )
  const { properties: liveProperties } = usePropertyCollection({
    source: 'live',
    filter: liveFilter,
  })
  const { properties: demoProperties } = usePropertyCollection({ source: 'demo' })
  const { properties: testProperties } = usePropertyCollection({ source: 'test' })
  const testProperty = computed<Property | null>(() => testProperties.value[0] ?? null)
  const {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Property, Property, Property>('property', {
    liveItems: liveProperties,
    demoItems: demoProperties,
    testItem: testProperty,
    getId: (property) => normalizeString(property.id),
  })

  const sourceProperties = computed(() => ({
    live: liveProperties.value,
    demo: demoProperties.value,
    test: testProperty.value,
  }))

  const consoleIndex = useConsoleIndex<Property, Property, Property>({
    entities: sourceProperties,
    selectEntity,
    getTestId: (property) => normalizeString(property.id),
    autoCreateTest: true,
    testCreateKey: userId,
    createTestEntity: async () => userId.value || null,
  })

  const debug = computed(() => ({
    mode: selectedMode.value,
    propertyId: selectedId.value,
    selectedProperty: selectedEntity.value,
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
    selectedProperty: selectedEntity,
    selectedMode,
    propertyId: selectedId,
    debug,
    clearSelectedProperty: clearSelection,
  }
}
