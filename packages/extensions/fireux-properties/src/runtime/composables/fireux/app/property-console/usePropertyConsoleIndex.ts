import { computed } from 'vue'
import {
  normalizeConsoleString as normalizeString,
  useConsole,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import type { Property } from '../../../../models/property.model'
import {
  createTestPropertySimulation,
  getDemoPropertySimulations,
  getLocalLiveProperties,
} from './demo-scenarios'

export function usePropertyConsoleIndex() {
  const { uid } = useAuth()
  const { currentUser, avatarSrc } = useUser()
  const userId = computed(() => normalizeString(uid.value))
  const liveProperties = computed<Property[]>(() => getLocalLiveProperties(userId.value))
  const demoProperties = computed<Property[]>(() => getDemoPropertySimulations())
  const testProperty = computed<Property | null>(() =>
    createTestPropertySimulation(
      userId.value,
      normalizeString(currentUser.value?.display_name),
      normalizeString(avatarSrc.value)
    )
  )
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
