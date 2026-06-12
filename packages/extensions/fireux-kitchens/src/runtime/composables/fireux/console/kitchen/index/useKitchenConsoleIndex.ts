import { computed } from 'vue'
import { useKitchenConsole } from '../core/useKitchenConsole'

export function useKitchenConsoleIndex() {
  const {
    kitchens,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useKitchenConsole()
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
  }))
  const isTenantSingleTarget = computed(
    () =>
      kitchens.source.autoSelectSingle.value &&
      Boolean(consoleSelection.kitchen.value)
  )
  const sections = computed(() => ({
    targets: {
      show: !isTenantSingleTarget.value,
      collection: kitchens.targets.value,
    },
  }))
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    canCreate: kitchens.source.canCreate.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      consoleActions.selectKitchen(String(id ?? '').trim())
    },
    clear: consoleActions.clearSelectedKitchen,
  }
  const debug = computed(() => ({
    kitchenId: consoleSelection.kitchenId.value,
    activeKitchenAppId: consoleRuntime.appId.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedKitchen: consoleSelection.kitchen.value,
    targetCount: kitchens.count.value,
    source: {
      name: kitchens.source.name.value,
      label: kitchens.source.label.value,
      readOnly: kitchens.source.readOnly.value,
      canCreate: kitchens.source.canCreate.value,
      autoSelectSingle: kitchens.source.autoSelectSingle.value,
      configKitchenIds: kitchens.source.configKitchenIds.value,
      myKitchenIds: kitchens.source.myKitchenIds.value,
    },
    isTenantSingleTarget: isTenantSingleTarget.value,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
