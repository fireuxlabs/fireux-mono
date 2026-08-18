// Concurrent edit — 2026-07-20 16:15 CEST — Console Spine pass: require current-user operator authority for Kitchen writes.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: source selected demo Kitchens through the lazy console adapter.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: select the Kitchen App support collection explicitly.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Console targets: reuse the server-projected root for live selection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: share one authenticated target collection and auto-select only projected targets.
// Concurrent edit — 2026-07-21 22:28 CEST — Console family alignment: validate source-aware Kitchen selection from its authoritative outcome.
// Concurrent edit — 2026-07-22 12:35 CEST — Kitchen palette console: keep projected Menu config and write capability authoritative over App support.
import { computed, watch } from 'vue'
import { useConsoleSelection } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleSelection'
import { useConsoleFamilyRuntime } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleFamilyRuntime'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useConsole } from 'fireux-core/runtime/composables/fireux/app/console/useConsole'
import {
  consoleData,
  type ConsoleData,
  type ConsoleDataType,
} from 'fireux-core/runtime/composables/fireux/app/console/useConsoleData'
import { useConsoleDataAuthority } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleDataAuthority'
import { targetHasOperator } from 'fireux-core/runtime/composables/fireux/app/console/useConsoleAccess'
import { useAuth } from 'fireux-core/runtime/composables/fireux/firebase/useAuth'
import { resolveConsoleEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { useConsoleEntityFirestore } from 'fireux-core/runtime/composables/fireux/firestore/system/console/utils/useConsoleEntityFirestore'
import {
  readRuntimeFirestoreDatabaseId,
  readRuntimeSimulationFirestoreDatabaseId,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  AppKitchenStorage,
  KitchenStorage,
} from '../../../../../models/kitchen.model'
import { composeKitchenScopedSurface } from '../../../../../utils/kitchen-spine'
import {
  useKitchenFetch,
  type KitchenFetchSource,
} from '../../../firestore/kitchen/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../../firestore/kitchen/utils/view/useKitchenInterface'
import { useKitchenConsoleTargetCollection } from '../index/useKitchenConsoleTargetCollection'
import { useKitchenConsoleDemoTargets } from './useKitchenConsoleDemoTargets'

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
  const composed = composeKitchenScopedSurface(
    publicKitchen,
    scoped
  ) as KitchenConsoleEntity | null
  if (!composed || !publicKitchen) return composed

  const projected = publicKitchen as KitchenConsoleEntity & {
    menus?: Record<string, unknown>
    console_theme?: Record<string, unknown>
  }
  return {
    ...composed,
    ...(projected.menus
      ? {
          menus: projected.menus,
          menu_style: projected.menu_style,
        }
      : {}),
    ...(projected.console_theme
      ? { console_theme: projected.console_theme }
      : {}),
  }
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
function createKitchenConsole() {
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
  const allowDemo = computed(() => consoleRoot.allowsDemo())
  const kitchenSource = computed<KitchenFetchSource>(() =>
    !allowDemo.value && normalizeSource(consoleRoot.source.value) === 'demo'
      ? 'live'
      : normalizeSource(consoleRoot.source.value)
  )
  const liveTargetCollection = useKitchenConsoleTargetCollection({
    enabled: true,
  })
  const demoTargets = useKitchenConsoleDemoTargets(
    computed(() => allowDemo.value && kitchenSource.value === 'demo')
  )
  const liveTargetData = computed<Array<ConsoleData<KitchenSurface>>>(() =>
    liveTargetCollection.kitchens.value.map((kitchen) =>
      consoleData('live', kitchen)
    )
  )
  const demoTargetData = computed<Array<ConsoleData<KitchenSurface>>>(() =>
    (demoTargets.data.value?.kitchens ?? []).map((kitchen) =>
      consoleData('demo', kitchen)
    )
  )
  const selectionTargets = computed<Array<ConsoleData<KitchenSurface>>>(() => {
    if (kitchenSource.value === 'live') {
      return liveTargetData.value
    }
    if (kitchenSource.value === 'demo') {
      return demoTargetData.value
    }
    return []
  })
  const selectionOutcome = computed(() => {
    if (kitchenSource.value === 'live') {
      return liveTargetCollection.outcome.value
    }
    if (kitchenSource.value === 'demo') return demoTargets.outcome.value
    return 'idle' as const
  })
  const enforcedTargetId = computed(() =>
    kitchenSource.value === 'live' &&
    selectionOutcome.value === 'ready' &&
    liveTargetData.value.length === 1
      ? normalizeString(liveTargetData.value[0]?.value.id)
      : ''
  )
  const {
    selectedId,
    selectedTarget: selectedData,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<ConsoleData<KitchenSurface>>('kitchen', {
    targetItems: selectionTargets,
    targetOutcome: selectionOutcome,
    getId: (data) => normalizeString(data.value.id),
    getType: (data) => data.type,
    enforcedTargetId,
  })
  const kitchenId = computed(() => normalizeString(selectedId.value))
  const directFetchSource = computed<KitchenFetchSource>(() =>
    kitchenSource.value === 'test' ? 'test' : 'demo'
  )
  const { kitchen: fetchedPublicKitchen } = useKitchenFetch(kitchenId, {
    source: directFetchSource,
  })
  const testTargetData = computed<ConsoleData<KitchenSurface> | null>(() =>
    kitchenSource.value === 'test' && fetchedPublicKitchen.value
      ? consoleData('test', fetchedPublicKitchen.value as KitchenSurface)
      : null
  )
  const resolvedSelectedData = computed<ConsoleData<KitchenSurface> | null>(
    () => {
      const data =
        kitchenSource.value === 'test'
          ? testTargetData.value
          : selectedData.value
      if (
        !data ||
        data.type !== kitchenSource.value ||
        normalizeString(data.value.id) !== kitchenId.value
      ) {
        return null
      }
      return data
    }
  )
  const dataType = computed<ConsoleDataType | null>(
    () => resolvedSelectedData.value?.type ?? null
  )
  const isDemo = computed(() => dataType.value === 'demo')
  const selectedPublicKitchen = computed<KitchenConsoleEntity | null>(
    () => resolvedSelectedData.value?.value ?? null
  )
  const { setAuthority, clearAuthority } = useConsoleDataAuthority('kitchen')
  watch(
    () => ({
      id: normalizeString(selectedPublicKitchen.value?.id),
      dataType: dataType.value,
    }),
    ({
      id,
      dataType: resolvedDataType,
    }: {
      id: string
      dataType: ConsoleDataType | null
    }) => {
      if (!id || id !== kitchenId.value || !resolvedDataType) {
        clearAuthority()
        return
      }
      setAuthority(id, resolvedDataType)
    },
    { immediate: true }
  )
  const scopedAppId = computed(() =>
    kitchenSource.value === 'live'
      ? resolveConsoleEntityAppId(
          selectedPublicKitchen.value,
          consoleRoot.appId
        )
      : consoleRoot.appId
  )
  const databaseId = computed(() =>
    kitchenSource.value === 'test'
      ? readRuntimeSimulationFirestoreDatabaseId() || ''
      : readRuntimeFirestoreDatabaseId() || ''
  )
  const firestore = useConsoleEntityFirestore({
    family: AppKitchenStorage.collection,
    target: selectedPublicKitchen,
    appId: scopedAppId,
    mode: dataType,
    active: computed(() => Boolean(dataType.value)),
    testCollectionPath: KitchenStorage.collection,
    useAppSupport: computed(
      () => dataType.value === 'live' && Boolean(scopedAppId.value)
    ),
  })
  const kitchenCollectionPath = firestore.writeCollection
  const liveScopedKitchenId = computed(() =>
    dataType.value === 'live' ? kitchenId.value : ''
  )
  const { kitchen: scopedKitchen } = useKitchenFetch(liveScopedKitchenId, {
    collectionPath: kitchenCollectionPath,
    hydrate: false,
  })
  const selectedKitchen = computed<KitchenConsoleEntity | null>(() =>
    dataType.value === 'live'
      ? composeConsoleKitchen(
          selectedPublicKitchen.value,
          scopedKitchen.value as KitchenConsoleEntity | null
        )
      : selectedPublicKitchen.value
  )
  const storageKitchenId = computed(() => (isDemo.value ? '' : kitchenId.value))
  const readOnly = computed(() => !dataType.value || isDemo.value)
  const canWrite = computed(
    () =>
      !readOnly.value &&
      (dataType.value === 'live'
        ? selectedPublicKitchen.value?.can_write === true
        : targetHasOperator(selectedKitchen.value, normalizeString(uid.value)))
  )
  const clearSelectedKitchen = () => clearSelection()
  const selectKitchen = (
    kitchenId: string,
    source: KitchenFetchSource = 'live'
  ) => {
    const requestedSource = normalizeSource(source)
    const resolvedSource =
      requestedSource === 'demo' && !allowDemo.value ? 'live' : requestedSource
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
    hasSelection: computed(() => Boolean(resolvedSelectedData.value)),
    demoPending: demoTargets.pending,
    demoError: demoTargets.error,
    demoOutcome: demoTargets.outcome,
  }
  const runtime = {
    appId: firestore.appId,
    source: kitchenSource,
    dataType,
    isDemo,
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
    isGlobal: computed(() => consoleRoot.isGlobal),
    allowDemo,
    readOnly,
    canWrite,
    canCreate: computed(() => !isDemo.value && consoleRoot.canCreateTarget()),
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

export function useKitchenConsole() {
  return useConsoleFamilyRuntime('kitchen', createKitchenConsole)
}
