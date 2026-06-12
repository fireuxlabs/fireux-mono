import { computed } from 'vue'
import type { KitchenConsoleListFilter } from './useKitchenConsoleList'
import { useKitchenConsole } from '../core/useKitchenConsole'
import type { Ref } from 'vue'

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const {
    targetKitchens,
    selectKitchen,
    selectedKitchen,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } = useKitchenConsole({
    filter: options.filter,
  })
  const selection = computed(() => ({
    kitchen: selectedKitchen.value,
    kitchenId: kitchenId.value,
  }))
  const sections = computed(() => ({
    targets: {
      show: true,
      collection: targetKitchens.value,
    },
  }))
  const runtime = computed(() => ({
    appId: activeKitchenAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    selectTarget: (id: string) => {
      selectKitchen(String(id ?? '').trim())
    },
    clear: clearSelectedKitchen,
  }
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    activeKitchenAppId: activeKitchenAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    selectedKitchen: selectedKitchen.value,
    targetCount: targetKitchens.value.length,
  }))

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
