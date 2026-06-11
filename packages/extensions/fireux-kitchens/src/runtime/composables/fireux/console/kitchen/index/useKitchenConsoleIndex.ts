import { computed, watch } from 'vue'
import { normalizeConsoleString as normalizeString } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { KitchenConsoleListFilter } from './useKitchenConsoleList'
import { type KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsole } from '../core/useKitchenConsole'
import type { Ref } from 'vue'

type UseKitchenConsoleIndexOptions = {
  filter?: KitchenConsoleListFilter | Ref<KitchenConsoleListFilter | null | undefined> | null
}

export function useKitchenConsoleIndex(
  options: UseKitchenConsoleIndexOptions = {}
) {
  const {
    liveKitchens,
    demoKitchens,
    testKitchen,
    policy,
    selectKitchen,
    selectedKitchen,
    selectedMode,
    kitchenId,
    activeKitchenAppId,
    rootCollection,
    canWrite,
    clearSelectedKitchen,
  } = useKitchenConsole({
    filter: options.filter,
  })

  const sourceKitchens = computed(() => ({
    live: liveKitchens.value,
    demo: demoKitchens.value,
    test: testKitchen.value,
  }))
  const consoleIndex = useConsoleIndex<KitchenSurface, KitchenSurface, KitchenSurface>({
    entities: sourceKitchens,
    selectEntity: selectKitchen,
    getTestId: (kitchen) => normalizeString(kitchen.id),
    debug: computed(() => ({
      selectedMode: selectedMode.value,
      kitchenId: kitchenId.value,
      activeKitchenAppId: activeKitchenAppId.value,
      rootCollection: rootCollection.value,
      canWrite: canWrite.value,
      policy: policy.value,
      selectedKitchen: selectedKitchen.value,
    })),
  })
  const selection = computed(() => ({
    kitchen: selectedKitchen.value,
    mode: selectedMode.value,
    kitchenId: kitchenId.value,
  }))
  const sections = computed(() => ({
    live: {
      show: policy.value.showLive,
      collection: consoleIndex.entities.value.live,
    },
    demo: {
      show: policy.value.showDemo,
      collection: consoleIndex.entities.value.demo,
    },
    test: {
      show: policy.value.showTest,
      init: policy.value.showTest,
    },
  }))
  const runtime = computed(() => ({
    appId: activeKitchenAppId.value,
    rootCollection: rootCollection.value,
    canWrite: canWrite.value,
  }))
  const actions = {
    ...consoleIndex.actions,
    clear: clearSelectedKitchen,
  }
  const debug = consoleIndex.debug
  watch(
    () => ({
      enabled: policy.value.autoSelectSingleLive,
      selectedId: kitchenId.value,
      live: liveKitchens.value,
    }),
    ({ enabled, selectedId, live }) => {
      if (!enabled || selectedId || live.length !== 1) return

      const id = normalizeString(live[0]?.id)
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
