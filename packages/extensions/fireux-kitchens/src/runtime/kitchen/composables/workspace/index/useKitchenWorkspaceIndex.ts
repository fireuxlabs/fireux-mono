// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make live and demo outcomes authoritative.
// Concurrent edit — 2026-07-20 16:22 CEST — Workspace Spine pass: include membership state in Kitchen target outcomes and bind real target ids.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazy-load Kitchen demo targets only on the workspace index.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Workspace targets: load live targets through the authenticated server projection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: make the server projection the sole live authority.
import { computed } from 'vue'
import { useWorkspaceIndex } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceIndex'
import type { KitchenFetchSource } from '../../firestore/fetch/useKitchenFetch'
import { useKitchenWorkspace } from '../core/useKitchenWorkspace'
import { useKitchenWorkspaceDemoData } from '../core/useKitchenWorkspaceDemoData'

export function useKitchenWorkspaceIndex() {
  const {
    targets: targetCollection,
    selection: workspaceSelection,
    runtime: workspaceRuntime,
    actions: workspaceActions,
  } = useKitchenWorkspace()
  const demoCollection = useKitchenWorkspaceDemoData(
    computed(() => workspaceRuntime.allowDemo.value)
  )
  const targetKitchens = computed(() => targetCollection.kitchens.value)
  const demoKitchens = computed(() => demoCollection.data.value?.kitchens ?? [])
  const targetOutcome = targetCollection.outcome
  const selectedOutcome = computed(() =>
    workspaceSelection.hasSelection.value
      ? 'ready'
      : workspaceSelection.kitchenSource.value === 'demo'
        ? demoCollection.outcome.value
        : targetOutcome.value
  )
  const selection = computed(() => ({
    kitchen: workspaceSelection.kitchen.value,
    kitchenId: workspaceSelection.kitchenId.value,
    kitchenSource: workspaceSelection.kitchenSource.value,
    hasSelection: workspaceSelection.hasSelection.value,
    outcome: selectedOutcome.value,
  }))
  const isLiveSelection = computed(
    () => workspaceSelection.kitchenSource.value === 'live'
  )
  const isTenantSingleTarget = computed(
    () =>
      workspaceRuntime.isTenant.value &&
      !workspaceRuntime.allowDemo.value &&
      isLiveSelection.value &&
      targetOutcome.value === 'ready' &&
      targetKitchens.value.length === 1 &&
      Boolean(workspaceSelection.kitchen.value)
  )
  const showTargetChooser = computed(() => true)
  const runtime = computed(() => ({
    appId: workspaceRuntime.appId.value,
    source: workspaceRuntime.source.value,
    kitchenCollectionPath: workspaceRuntime.kitchenCollectionPath.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    canCreate: workspaceRuntime.canCreate.value,
  }))
  const debug = computed(() => ({
    kitchenId: workspaceSelection.kitchenId.value,
    kitchenSource: workspaceSelection.kitchenSource.value,
    activeKitchenAppId: workspaceRuntime.appId.value,
    source: workspaceRuntime.source.value,
    kitchenCollectionPath: workspaceRuntime.kitchenCollectionPath.value,
    rootCollection: workspaceRuntime.rootCollection.value,
    databaseId: workspaceRuntime.databaseId.value,
    readOnly: workspaceRuntime.readOnly.value,
    canWrite: workspaceRuntime.canWrite.value,
    selectedKitchen: workspaceSelection.kitchen.value,
    targetCount: targetKitchens.value.length,
    demoTargetCount: demoKitchens.value.length,
    targetSource: {
      authority: 'authenticated-server-projection',
      outcome: targetOutcome.value,
    },
    isTenantSingleTarget: isTenantSingleTarget.value,
  }))

  const index = useWorkspaceIndex({
    selection,
    selectedId: computed(() => workspaceSelection.kitchenId.value),
    runtime,
    targets: targetKitchens,
    outcome: targetOutcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    showTargets: showTargetChooser,
    selectTarget: (id: string) => {
      workspaceActions.selectKitchen(String(id ?? '').trim(), 'live')
    },
    clearSelection: workspaceActions.clearSelectedKitchen,
    debug,
  })
  const sections = computed(() => ({
    ...index.sections.value,
    locked: isTenantSingleTarget.value,
    demoTargets: {
      show:
        workspaceRuntime.allowDemo.value && index.sections.value.targets.show,
      collection: demoKitchens.value,
      outcome: demoCollection.outcome.value,
    },
  }))
  const actions = {
    ...index.actions,
    clear: () => {
      if (!isTenantSingleTarget.value) index.actions.clear()
    },
    selectTarget: (id: string, source: KitchenFetchSource = 'live') => {
      workspaceActions.selectKitchen(String(id ?? '').trim(), source)
    },
  }

  return {
    ...index,
    sections,
    actions,
  }
}
