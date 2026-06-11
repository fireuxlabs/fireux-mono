import { computed } from 'vue'
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
    liveProperties: targetProperties,
    selectedProperty,
    propertyId,
    activePropertyAppId,
    rootCollection,
    canWrite,
    selectProperty,
    clearSelectedProperty,
  } = usePropertyConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    property: selectedProperty.value,
    propertyId: propertyId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: targetProperties.value,
    },
  }))
  const runtime = computed(() => ({
    appId: activePropertyAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      selectProperty(String(id ?? '').trim(), 'live')
    },
    clear: clearSelectedProperty,
  }
  const debug = computed(() => ({
    propertyId: propertyId.value,
    activePropertyAppId: activePropertyAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedProperty: selectedProperty.value,
    targetCount: targetProperties.value.length,
    status: 'property console uses scaffold data until Firestore property fetch/create is wired',
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
