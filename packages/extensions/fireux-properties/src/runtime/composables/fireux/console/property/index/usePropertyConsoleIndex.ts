import { computed, unref } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import type { PropertyCollectionFilter } from '../../../firestore/property/fetch/usePropertyCollection'
import { usePropertyConsole } from '../core/usePropertyConsole'
import type { Ref } from 'vue'

type UsePropertyConsoleIndexOptions = {
  filter?: PropertyCollectionFilter | Ref<PropertyCollectionFilter | null | undefined> | null
}

export function usePropertyConsoleIndex(
  options: UsePropertyConsoleIndexOptions = {}
) {
  const consoleTargets = useConsoleTargets({ family: 'property' })
  const targetFilter = computed<PropertyCollectionFilter>(() => {
    const explicit = options.filter ? unref(options.filter) ?? {} : {}

    return consoleTargets.filter(explicit)
  })
  const {
    properties,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = usePropertyConsole({
    filter: targetFilter,
  })
  const selection = computed(() => ({
    property: consoleSelection.property.value,
    propertyId: consoleSelection.propertyId.value,
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
  }))
  const debug = computed(() => ({
    propertyId: consoleSelection.propertyId.value,
    activePropertyAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedProperty: consoleSelection.property.value,
    targetCount: properties.count.value,
    source: consoleTargets.debug.value,
    status: 'property console uses scaffold data until Firestore property fetch/create is wired',
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.propertyId.value),
    autoSelectTargetId: computed(() =>
      consoleTargets.singleTargetId.value
    ),
    runtime,
    targets: properties.targets,
    pending: properties.pending,
    outcome: properties.outcome,
    selectTarget: (id: string) => {
      consoleActions.selectProperty(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedProperty,
    debug,
  })
}
