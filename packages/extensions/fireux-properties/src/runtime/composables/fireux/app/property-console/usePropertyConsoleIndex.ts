import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { Property } from '../../../../models/property.model'

const emptyProperties = computed<Property[]>(() => [])
const emptyTestProperty = computed<Property | null>(() => null)

export function usePropertyConsoleIndex() {
  const {
    selectedId,
    selectedMode,
    selectedEntity,
    selectEntity,
    clearSelection,
  } = useConsole<Property, Property, Property>('property', {
    liveItems: emptyProperties,
    demoItems: emptyProperties,
    testItem: emptyTestProperty,
    getId: (property) => normalizeString(property.id),
  })

  const sourceProperties = computed(() => ({
    live: emptyProperties.value,
    demo: emptyProperties.value,
    test: emptyTestProperty.value,
  }))

  const consoleIndex = useConsoleIndex<Property, Property, Property>({
    entities: sourceProperties,
    selectEntity,
    getTestId: (property) => normalizeString(property.id),
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
    status: 'property console data wiring is intentionally not attached to portfolio',
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
