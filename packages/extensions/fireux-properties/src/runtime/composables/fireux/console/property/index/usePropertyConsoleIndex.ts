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
    properties,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = usePropertyConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    property: consoleSelection.property.value,
    propertyId: consoleSelection.propertyId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: properties.targets.value,
      pending: properties.pending.value,
    },
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      consoleActions.selectProperty(String(id ?? '').trim())
    },
    clear: consoleActions.clearSelectedProperty,
  }
  const debug = computed(() => ({
    propertyId: consoleSelection.propertyId.value,
    activePropertyAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedProperty: consoleSelection.property.value,
    targetCount: properties.count.value,
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
