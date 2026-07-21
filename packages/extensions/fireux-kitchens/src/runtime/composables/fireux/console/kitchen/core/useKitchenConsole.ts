// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require current-user operator authority for Kitchen writes.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: source selected demo Kitchens through the lazy console adapter.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: select the Kitchen App support collection explicitly.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: reuse the server-projected root for live selection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: share one authenticated target collection and auto-select only projected targets.
// Concurrent edit — 2026-07-21 22:28 CEST — Console family alignment: validate source-aware Kitchen selection from its authoritative outcome.
import { computed, watch } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { useConsoleEntityFirestore } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/useConsoleEntityFirestore'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { KitchenStorage } from '../../../../../models/kitchen.model'
import { composeKitchenScopedSurface } from '../../../../../utils/kitchen-spine'
import {
  useKitchenFetch,
  type KitchenFetchSource,
} from '../../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsoleTargetCollection } from '../index/useKitchenConsoleTargetCollection'
import {
  useKitchenConsoleDemoData,
} from './useKitchenConsoleDemoData'

type KitchenConsoleEntity = KitchenSurface

const normalizeSource = (value: unknown): KitchenFetchSource => {
  const source = normalizeString(value)
  if (source === 'demo' || source === 'test') return source
  return 'live'
}

const composeConsoleKitchen = (
  publicKitchen: KitchenConsoleEntity | null,
  scoped: KitchenConsoleEntity | null
): KitchenConsoleEntity | null => {
  return composeKitchenScopedSurface(
    publicKitchen,
    scoped
  ) as KitchenConsoleEntity | null
}

/**
 * FireUX stack family: Console-backed root entity.
 * Entity: Kitchen.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * This file adapts the selected public Kitchen into the selected /console/kitchen scope.
 * Index pages own Kitchen target collection reads.
 * It should not own Kitchen child operation records; those live under console/kitchen/operations.
 */
export function useKitchenConsole() {
  /*
   * Input:
   * - runtime app config
   * - stored console selection
   *
   * Process:
   * - keep the selected Kitchen id in the shared console cookie
   * - read the selected public Kitchen
   * - read the selected app-scoped Kitchen
   * - compose one selected Kitchen view for console consumers
   * - derive the selected Kitchen scope path and write permission
   *
   * Output:
   * - selection: selected Kitchen state
   * - runtime: selected Kitchen scope/read/write context
   * - actions: select/clear helpers
  */
  const consoleRoot = useConsole('kitchen')
  const { uid } = useAuth()
  const kitchenSource = computed<KitchenFetchSource>(() =>
    normalizeSource(consoleRoot.source.value)
  )
  const liveTargetCollection = useKitchenConsoleTargetCollection()
  const demoData = useKitchenConsoleDemoData(
    computed(() => kitchenSource.value === 'demo')
  )
  const selectionTargets = computed<KitchenSurface[]>(() => {
    if (kitchenSource.value === 'live') {
      return liveTargetCollection.kitchens.value
    }
    if (kitchenSource.value === 'demo') {
      return demoData.data.value?.kitchens ?? []
    }
    return []
  })
  const selectionOutcome = computed(() => {
    if (kitchenSource.value === 'live') {
      return liveTargetCollection.outcome.value
    }
    if (kitchenSource.value === 'demo') return demoData.outcome.value
    return 'idle' as const
  })
  const {
    selectedId,
    selectedTarget,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<KitchenSurface>('kitchen', {
    targetItems: selectionTargets,
    targetOutcome: selectionOutcome,
    getId: kitchen => normalizeString(kitchen.id),
  })
  const kitchenId = computed(() => normalizeString(selectedId.value))
  const directFetchSource = computed<KitchenFetchSource>(() =>
    kitchenSource.value === 'test' ? 'test' : 'demo'
  )
  const { kitchen: fetchedPublicKitchen } = useKitchenFetch(kitchenId, {
    source: directFetchSource,
  })
  const selectedPublicKitchen = computed<KitchenConsoleEntity | null>(
    () => kitchenSource.value === 'test'
      ? fetchedPublicKitchen.value as KitchenConsoleEntity | null
      : selectedTarget.value as KitchenConsoleEntity | null
  )
  const scopedAppId = computed(() =>
    kitchenSource.value === 'live'
      ? resolveConsoleEntityAppId(selectedPublicKitchen.value, consoleRoot.appId)
      : consoleRoot.appId
  )
  const databaseId = computed(() =>
    kitchenSource.value === 'test'
      ? readRuntimeSimulationFirestoreDatabaseId() || ''
      : readRuntimeFirestoreDatabaseId() || ''
  )
  const firestore = useConsoleEntityFirestore({
    family: KitchenStorage.scopeCollection,
    target: selectedPublicKitchen,
    appId: scopedAppId,
    mode: kitchenSource,
    testCollectionPath: KitchenStorage.rootCollection,
    useAppSupport: computed(
      () => kitchenSource.value === 'live' && Boolean(scopedAppId.value)
    ),
  })
  const kitchenCollectionPath = firestore.writeCollection
  const liveScopedKitchenId = computed(() =>
    kitchenSource.value === 'live' ? kitchenId.value : ''
  )
  const { kitchen: scopedKitchen } = useKitchenFetch(liveScopedKitchenId, {
    collectionPath: kitchenCollectionPath,
    hydrate: false,
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(
    () =>
      kitchenSource.value === 'live'
        ? composeConsoleKitchen(
            selectedPublicKitchen.value,
            scopedKitchen.value as KitchenConsoleEntity | null
          )
        : selectedPublicKitchen.value
  )
  const storageKitchenId = computed(() =>
    kitchenSource.value === 'demo' ? '' : kitchenId.value
  )
  const readOnly = computed(() => consoleRoot.readOnly.value)
  const canWrite = computed(() =>
    !readOnly.value &&
      targetHasOperator(selectedKitchen.value, normalizeString(uid.value))
  )
  const clearSelectedKitchen = () => clearSelection()
  const selectKitchen = (
    kitchenId: string,
    source: KitchenFetchSource = 'live'
  ) => {
    const resolvedSource = normalizeSource(source)
    selectTarget(kitchenId, resolvedSource)
  }
  watch(
    kitchenId,
    (id: string) => {
      if (id) return
      consoleRoot.resetSource()
    },
    { immediate: true }
  )
  const selection = {
    kitchen: selectedKitchen,
    kitchenId,
    kitchenSource,
    hasSelection: computed(() =>
      kitchenSource.value === 'test'
        ? Boolean(fetchedPublicKitchen.value)
        : Boolean(selectedTarget.value)
    ),
    demoPending: demoData.pending,
    demoError: demoData.error,
    demoOutcome: demoData.outcome,
  }
  const runtime = {
    appId: firestore.appId,
    source: kitchenSource,
    canonicalRootCollection: firestore.rootCollection,
    collectionPath: firestore.collectionPath,
    isTenantOwned: firestore.isTenantOwned,
    kitchenCollectionPath,
    rootCollection: kitchenCollectionPath,
    storageKitchenId,
    scopeState: firestore.scopeState,
    appSupportCollection: firestore.appSupportCollection,
    usesAppSupport: firestore.usesAppSupport,
    writeCollection: firestore.writeCollection,
    databaseId,
    isTenant: computed(() => consoleRoot.isTenant),
    readOnly,
    canWrite,
    canCreate: computed(() => consoleRoot.canCreateTarget()),
  }
  const actions = {
    selectKitchen,
    clearSelectedKitchen,
  }

  return {
    targets: liveTargetCollection,
    selection,
    runtime,
    actions,
  }
}
