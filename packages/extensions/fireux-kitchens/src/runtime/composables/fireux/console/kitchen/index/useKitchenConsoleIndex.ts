import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useKitchenCollection } from '../../../firestore/kitchen/fetch/useKitchenCollection'
import type { KitchenFetchSource } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenConsole } from '../core/useKitchenConsole'

export function useKitchenConsoleIndex() {
  const { coreUser, pending: userPending } = useUser()
  const {
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useKitchenConsole()
  const myKitchenIds = computed(() =>
    Array.isArray(coreUser.value?.myKitchens) ? coreUser.value.myKitchens : []
  )
  const consoleTargets = useConsoleTargets({
    family: 'kitchen',
    globalTargetIds: myKitchenIds,
  })
  const targetIds = consoleTargets.targetIds
  const targetCollection = useKitchenCollection({ ids: targetIds })
  const demoCollection = useKitchenCollection({
    source: 'demo',
  })
  const targetKitchens = computed(() => targetCollection.kitchens.value)
  const demoKitchens = computed(() => demoCollection.kitchens.value)
  const targetPending = computed(() =>
    consoleTargets.isTenant
      ? targetCollection.pending.value
      : Boolean(userPending.value || targetCollection.pending.value)
  )
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
    kitchenSource: consoleSelection.kitchenSource.value,
  }))
  const isTenantSingleTarget = computed(
    () =>
      consoleTargets.isSingleTenantTarget &&
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
    canCreate: consoleTargets.canCreate,
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
    pending: targetPending,
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
      pending: demoCollection.pending.value,
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
