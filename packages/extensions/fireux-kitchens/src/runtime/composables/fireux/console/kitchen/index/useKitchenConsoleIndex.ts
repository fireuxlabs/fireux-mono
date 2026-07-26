// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make live and demo outcomes authoritative.
// Concurrent edit — 2026-07-20 16:22 CEST — Console Spine pass: include membership state in Kitchen target outcomes and bind real target ids.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazy-load Kitchen demo targets only on the console index.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: load live targets through the authenticated server projection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: make the server projection the sole live authority.
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import type { KitchenFetchSource } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenConsole } from '../core/useKitchenConsole'
import { useKitchenConsoleDemoData } from '../core/useKitchenConsoleDemoData'

export function useKitchenConsoleIndex() {
  const {
    targets: targetCollection,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useKitchenConsole()
  const demoCollection = useKitchenConsoleDemoData(true)
  const targetKitchens = computed(() => targetCollection.kitchens.value)
  const demoKitchens = computed(() => demoCollection.data.value?.kitchens ?? [])
  const targetOutcome = targetCollection.outcome
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
    kitchenSource: consoleSelection.kitchenSource.value,
  }))
  const isTenantSingleTarget = computed(
    () =>
      consoleRuntime.isTenant.value &&
      targetOutcome.value === 'ready' &&
      targetKitchens.value.length === 1 &&
      Boolean(consoleSelection.kitchen.value)
  )
  const autoSelectTargetId = computed(() =>
    consoleRuntime.isTenant.value &&
    targetOutcome.value === 'ready' &&
    targetKitchens.value.length === 1
      ? String(targetKitchens.value[0]?.id ?? '').trim()
      : ''
  )
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    source: consoleRuntime.source.value,
    kitchenCollectionPath: consoleRuntime.kitchenCollectionPath.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    canCreate: consoleRuntime.canCreate.value,
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
    targetSource: {
      authority: 'authenticated-server-projection',
      outcome: targetOutcome.value,
    },
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
