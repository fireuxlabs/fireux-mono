// Concurrent edit — 2026-07-19 17:36 CEST — Repo Efficiency Pass 6 of 6: make live and demo outcomes authoritative.
// Concurrent edit — 2026-07-20 16:22 CEST — Console Spine pass: include membership state in Kitchen target outcomes and bind real target ids.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: lazy-load Kitchen demo targets only on the console index.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: load live targets through the authenticated server projection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: make the server projection the sole live authority.
import { computed } from 'vue'
import { useConsoleIndex } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleIndex'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import type { KitchenFetchSource } from '../../../firestore/kitchen/fetch/useKitchenFetch'
import { useKitchenConsole } from '../core/useKitchenConsole'
import { useKitchenConsoleDemoData } from '../core/useKitchenConsoleDemoData'

export function useKitchenConsoleIndex() {
  const { currentUser, hasAuthState, isAuthenticated } = useAuth()
  const {
    targets: targetCollection,
    selection: consoleSelection,
    runtime: consoleRuntime,
    actions: consoleActions,
  } = useKitchenConsole({
    keepLiveTargetsAvailable: true,
  })
  const demoCollection = useKitchenConsoleDemoData(
    computed(() => consoleRuntime.allowDemo.value)
  )
  const targetKitchens = computed(() => targetCollection.kitchens.value)
  const kitchenApps = computed(() => targetCollection.apps.value)
  const demoKitchens = computed(() => demoCollection.data.value?.kitchens ?? [])
  const targetOutcome = targetCollection.outcome
  const isTenantSingleTarget = computed(
    () =>
      consoleRuntime.isTenant.value &&
      !consoleRuntime.allowDemo.value &&
      targetOutcome.value === 'ready' &&
      targetKitchens.value.length === 1
  )
  const selectedOutcome = computed(() =>
    isTenantSingleTarget.value
      ? targetOutcome.value
      : consoleSelection.hasSelection.value
        ? 'ready'
        : consoleSelection.kitchenSource.value === 'demo'
          ? demoCollection.outcome.value
          : targetOutcome.value
  )
  const selection = computed(() => ({
    kitchen: consoleSelection.kitchen.value,
    kitchenId: consoleSelection.kitchenId.value,
    kitchenSource: consoleSelection.kitchenSource.value,
    hasSelection: consoleSelection.hasSelection.value,
    outcome: selectedOutcome.value,
  }))
  const showTargetChooser = computed(() => true)
  const runtime = computed(() => ({
    appId: consoleRuntime.appId.value,
    source: consoleRuntime.source.value,
    kitchenCollectionPath: consoleRuntime.kitchenCollectionPath.value,
    rootCollection: consoleRuntime.rootCollection.value,
    readOnly: consoleRuntime.readOnly.value,
    canWrite: consoleRuntime.canWrite.value,
    canCreate: consoleRuntime.canCreate.value,
  }))
  const debug = computed(() => {
    const committedId = String(consoleSelection.kitchenId.value ?? '').trim()
    const selectedKitchen = consoleSelection.kitchen.value
    const selectedType = committedId
      ? consoleSelection.kitchenSource.value
      : null
    const selectionStatus = selectedKitchen
      ? 'selected'
      : committedId
        ? 'resolving'
        : 'none'
    const runtimeActive = Boolean(
      selectedKitchen && consoleRuntime.dataType.value
    )

    return {
      consoleKitchen: {
        workspace: {
          app: {
            id: consoleRuntime.appId.value,
            role: selectedKitchen?.console?.app_role ?? null,
          },
          collection: runtimeActive
            ? {
                root: consoleRuntime.canonicalRootCollection.value || null,
                scoped:
                  consoleRuntime.kitchenCollectionPath.value || null,
              }
            : null,
        },
        selectedKitchen: {
          status: selectionStatus,
          source: selectedType,
          id: committedId || null,
          slug: selectedKitchen?.slug ?? null,
          name: selectedKitchen?.name ?? null,
          userAccess: runtimeActive
            ? {
                canWrite: consoleRuntime.canWrite.value,
              }
            : null,
        },
        user: {
          authentication: {
            status: !hasAuthState.value
              ? 'resolving'
              : isAuthenticated.value
                ? 'authenticated'
                : 'unauthenticated',
            id: currentUser.value?.uid ?? null,
            displayName: currentUser.value?.displayName ?? null,
          },
        },
        myKitchens: {
          endpoint: '/api/console/kitchen/targets',
          outcome: targetOutcome.value,
          count: targetKitchens.value.length,
          enforcedSingleTarget: isTenantSingleTarget.value,
        },
        demoKitchens: {
          adapter: 'useKitchenConsoleDemoData',
          owner: 'fireux-kitchens',
          enabled: consoleRuntime.allowDemo.value,
          count: demoKitchens.value.length,
          outcome: demoCollection.outcome.value,
        },
        myKitchenApps: {
          endpoint: '/api/console/kitchen/targets',
          action: 'open-app',
          route: '/apps/{appId}',
          count: kitchenApps.value.length,
          visible: consoleRuntime.isGlobal.value && kitchenApps.value.length > 0,
        },
      },
    }
  })

  const index = useConsoleIndex({
    selection,
    runtime,
    targets: targetKitchens,
    outcome: targetOutcome,
    getTargetId: (target) => String(target?.id ?? '').trim(),
    showTargets: showTargetChooser,
    selectTarget: (id: string) => {
      consoleActions.selectKitchen(String(id ?? '').trim(), 'live')
    },
    clearSelection: consoleActions.clearSelectedKitchen,
    debug,
    includeCountsInDebug: false,
  })
  const sections = computed(() => ({
    ...index.sections.value,
    locked: isTenantSingleTarget.value,
    kitchenApps: {
      show: consoleRuntime.isGlobal.value && kitchenApps.value.length > 0,
      collection: kitchenApps.value,
    },
    demoTargets: {
      show:
        consoleRuntime.allowDemo.value &&
        index.sections.value.targets.show,
      collection: demoKitchens.value,
      outcome: demoCollection.outcome.value,
    },
  }))
  const actions = {
    ...index.actions,
    clear: () => {
      if (!isTenantSingleTarget.value) index.actions.clear()
    },
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
