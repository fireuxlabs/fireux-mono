import { computed } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import type { KitchenConsoleListFilter } from './useKitchenConsoleList'
import { useKitchenConsole } from '../core/useKitchenConsole'
import type { Ref } from 'vue'

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const fireux = useFireUXConfig()
  const {
    kitchens,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useKitchenConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
  }))
  const isTenantSingleTarget = computed(
    () =>
      fireux.isTenant &&
      kitchens.targets.value.length === 1 &&
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
    canWrite: consoleRuntime.canWrite.value,
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
    canWrite: consoleRuntime.canWrite.value,
    selectedKitchen: consoleSelection.kitchen.value,
    targetCount: kitchens.targets.value.length,
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
