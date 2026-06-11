import { computed, watch } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
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
    liveKitchens: targetKitchens,
    policy,
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
      selectKitchen(String(id ?? '').trim(), 'live')
    },
    clear: clearSelectedKitchen,
  }
  const debug = computed(() => ({
    kitchenId: kitchenId.value,
    activeKitchenAppId: activeKitchenAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
    policy: policy.value,
    selectedKitchen: selectedKitchen.value,
    targetCount: targetKitchens.value.length,
  }))
  watch(
    () => ({
      enabled: policy.value.autoSelectSingleLive,
      selectedId: kitchenId.value,
      targets: targetKitchens.value,
    }),
    ({ enabled, selectedId, targets }) => {
      if (!enabled || selectedId || targets.length !== 1) return

      const id = normalizeString(targets[0]?.id)
      if (id) selectKitchen(id, 'live')
    },
    { immediate: true }
  )

  return {
    selection,
    sections,
    runtime,
    actions,
    debug,
  }
}
