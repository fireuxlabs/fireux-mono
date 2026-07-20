// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make live and demo outcomes authoritative.
// Concurrent edit — 2026-07-20 16:22 CEST — Console Spine pass: include membership state in Kitchen target outcomes and bind real target ids.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazy-load Kitchen demo targets only on the console index.
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import {
  useKitchenCollection,
  type KitchenCollectionFilter,
} from '../../../firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenFetchSource } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenConsole } from '../core/useKitchenConsole'
import { useKitchenConsoleDemoData } from '../core/useKitchenConsoleDemoData'

export function useKitchenConsoleIndex() {
  const {
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useKitchenConsole()
  const consoleTargets = useConsoleTargets({ family: 'kitchen' })
  const targetFilter = computed<KitchenCollectionFilter>(() =>
    consoleTargets.filter({})
  )
  const targetCollection = useKitchenCollection({ filter: targetFilter })
  const demoCollection = useKitchenConsoleDemoData(true)
  const targetKitchens = computed(() => targetCollection.kitchens.value)
  const demoKitchens = computed(() => demoCollection.data.value?.kitchens ?? [])
  const targetOutcome = consoleTargets.resolveOutcome(targetCollection.outcome)
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
    kitchenSource: consoleSelection.kitchenSource.value,
  }))
  const isTenantSingleTarget = computed(
    () =>
      consoleTargets.isSingleTenantTarget.value &&
      Boolean(consoleSelection.kitchen.value)
  )
  const autoSelectTargetId = consoleTargets.singleTargetId
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    source: consoleRuntime.source.value,
    kitchenCollectionPath: consoleRuntime.kitchenCollectionPath.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    canCreate: consoleTargets.canCreate.value,
  }))
  const debug = computed(() => ({
    kitchenId: consoleSelection.kitchenId.value,
    kitchenSource: consoleSelection.kitchenSource.value,
    activeKitchenAppId: consoleRuntime.appId.value,
    source: consoleRuntime.source.value,
    kitchenCollectionPath: consoleRuntime.kitchenCollectionPath.value,
    rootCollection: consoleRuntime.rootCollection.value,
    databaseId: consoleRuntime.databaseId.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedKitchen: consoleSelection.kitchen.value,
    targetCount: targetKitchens.value.length,
    demoTargetCount: demoKitchens.value.length,
    targetSource: consoleTargets.debug.value,
    isTenantSingleTarget: isTenantSingleTarget.value,
  }))

  const index = useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.kitchenId.value),
    autoSelectTargetId,
    runtime,
    targets: targetKitchens,
    outcome: targetOutcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    showTargets: computed(() => !isTenantSingleTarget.value),
    selectTarget: (id: string) => {
      consoleActions.selectKitchen(String(id ?? '').trim(), 'live')
    },
    clearSelection: consoleActions.clearSelectedKitchen,
    debug,
  })
  const sections = computed(() => ({
    ...index.sections.value,
    demoTargets: {
      show: !isTenantSingleTarget.value,
      collection: demoKitchens.value,
      outcome: demoCollection.outcome.value,
    },
  }))
  const actions = {
    ...index.actions,
    selectTarget: (
      id: string,
      source: KitchenFetchSource = 'live'
    ) => {
      consoleActions.selectKitchen(String(id ?? '').trim(), source)
    },
  }

  return {
    ...index,
    sections,
    actions,
  }
}
