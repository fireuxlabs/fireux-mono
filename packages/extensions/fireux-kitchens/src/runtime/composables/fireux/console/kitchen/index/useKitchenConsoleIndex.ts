import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useConsoleTargets } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleTargets'
import { useUser } from 'fireux-core/runtime/composables/fireux/firestore/core/user/useUser'
import { useKitchenCollection } from '../../../firestore/kitchen/fetch/useKitchenCollection'
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
  const targetKitchens = computed(() => targetCollection.kitchens.value)
  const targetPending = computed(() =>
    consoleTargets.isTenant
      ? targetCollection.pending.value
      : Boolean(userPending.value || targetCollection.pending.value)
  )
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
  }))
  const isTenantSingleTarget = computed(
    () =>
      consoleTargets.isSingleTenantTarget &&
      Boolean(consoleSelection.kitchen.value)
  )
  const autoSelectTargetId = consoleTargets.singleTargetId
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    kitchenCollectionPath: consoleRuntime.kitchenCollectionPath.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    canCreate: consoleTargets.canCreate,
  }))
  const debug = computed(() => ({
    kitchenId: consoleSelection.kitchenId.value,
    activeKitchenAppId: consoleRuntime.appId.value,
    kitchenCollectionPath: consoleRuntime.kitchenCollectionPath.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    selectedKitchen: consoleSelection.kitchen.value,
    targetCount: targetKitchens.value.length,
    source: consoleTargets.debug.value,
    isTenantSingleTarget: isTenantSingleTarget.value,
  }))

  return useConsoleIndex({
    selection,
    selectedId: computed(() => consoleSelection.kitchenId.value),
    autoSelectTargetId,
    runtime,
    targets: targetKitchens,
    pending: targetPending,
    showTargets: computed(() => !isTenantSingleTarget.value),
    selectTarget: (id: string) => {
      consoleActions.selectKitchen(String(id ?? '').trim())
    },
    clearSelection: consoleActions.clearSelectedKitchen,
    debug,
  })
}
