// Concurrent edit — 2026-07-20 16:15 CEST — Workspace Spine pass: require current-user operator authority for Kitchen writes.
// Concurrent edit — 2026-07-20 17:17 CEST — Demo Data Spine pass: source selected demo Kitchens through the lazy workspace adapter.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: select the Kitchen App support collection explicitly.
// Concurrent edit — 2026-07-21 20:57 CEST — Kitchen Workspace targets: reuse the server-projected root for live selection.
// Concurrent edit — 2026-07-21 21:41 CEST — Kitchen target outcome: share one authenticated target collection and auto-select only projected targets.
// Concurrent edit — 2026-07-21 22:28 CEST — Workspace family alignment: validate source-aware Kitchen selection from its authoritative outcome.
// Concurrent edit — 2026-07-22 12:35 CEST — Kitchen palette workspace: keep projected Menu config and write capability authoritative over App support.
import { computed, watch } from 'vue'
import { useWorkspaceSelection } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceSelection'
import { useWorkspaceFamilyRuntime } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceFamilyRuntime'
import { normalizeString } from 'fireux-core/runtime/utils/string'
import { useWorkspace } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspace'
import {
  workspaceData,
  type WorkspaceData,
  type WorkspaceDataType,
} from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceData'
import { useWorkspaceDataAuthority } from 'fireux-core/runtime/composables/fireux/workspace/useWorkspaceDataAuthority'
import { resolveWorkspaceEntityAppId } from 'fireux-core/runtime/composables/fireux/firestore/system/workspace/utils/resolveWorkspaceEntityCollectionPath'
import { useWorkspaceEntityFirestore } from 'fireux-core/runtime/composables/fireux/firestore/system/workspace/utils/useWorkspaceEntityFirestore'
import { readRuntimeFirestoreDatabaseId } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { composeKitchenScopedSurface } from '../../../utils/kitchen-readers'
import { useKitchenFetch } from '../../firestore/fetch/useKitchenFetch'
import type { KitchenSurface } from '../../firestore/utils/view/useKitchenInterface'
import { useKitchenWorkspaceTargetCollection } from '../index/useKitchenWorkspaceTargetCollection'

type KitchenWorkspaceEntity = KitchenSurface

const composeWorkspaceKitchen = (
  publicKitchen: KitchenWorkspaceEntity | null,
  scoped: KitchenWorkspaceEntity | null
): KitchenWorkspaceEntity | null => {
  const composed = composeKitchenScopedSurface(
    publicKitchen,
    scoped
  ) as KitchenWorkspaceEntity | null
  if (!composed || !publicKitchen) return composed

  const projected = publicKitchen as KitchenWorkspaceEntity & {
    menus?: Record<string, unknown>
    workspace_theme?: Record<string, unknown>
  }
  return {
    ...composed,
    ...(projected.menus
      ? {
          menus: projected.menus,
          menu_style: projected.menu_style,
        }
      : {}),
    ...(projected.workspace_theme
      ? { workspace_theme: projected.workspace_theme }
      : {}),
  }
}

/**
 * FireUX stack family: Workspace-backed root entity.
 * Entity: Kitchen.
 * Canon:
 * - docs/fireux-canon.md
 * - packages/core/fireux-docs/src/runtime/concepts/stacks/README.md
 * Contract:
 * - packages/extensions/fireux-kitchens/docs/contract.md
 *
 * This file adapts the selected public Kitchen into the selected /workspace/kitchen scope.
 * Index pages own Kitchen target collection reads.
 * It should not own Kitchen child operation records; those live under workspace/kitchen/operations.
 */
function createKitchenWorkspace() {
  /*
   * Input:
   * - runtime app config
   * - stored workspace selection
   *
   * Process:
   * - keep the selected Kitchen id in the shared workspace cookie
   * - read the selected public Kitchen
   * - read the selected app-scoped Kitchen
   * - compose one selected Kitchen view for workspace consumers
   * - derive the selected Kitchen scope path and write permission
   *
   * Output:
   * - selection: selected Kitchen state
   * - runtime: selected Kitchen scope/read/write context
   * - actions: select/clear helpers
   */
  const workspaceRoot = useWorkspace('kitchen')
  const kitchenSource = computed(() => 'live' as const)
  const liveTargetCollection = useKitchenWorkspaceTargetCollection({
    enabled: true,
  })
  const liveTargetData = computed<Array<WorkspaceData<KitchenSurface>>>(() =>
    liveTargetCollection.kitchens.value.map((kitchen) =>
      workspaceData('live', kitchen)
    )
  )
  const selectionTargets = liveTargetData
  const selectionOutcome = liveTargetCollection.outcome
  const enforcedTargetId = computed(() =>
    selectionOutcome.value === 'ready' && liveTargetData.value.length === 1
      ? normalizeString(liveTargetData.value[0]?.value.id)
      : ''
  )
  const {
    selectedId,
    selectedTarget: selectedData,
    selectTarget,
    clearSelection,
  } = useWorkspaceSelection<WorkspaceData<KitchenSurface>>('kitchen', {
    targetItems: selectionTargets,
    targetOutcome: selectionOutcome,
    getId: (data) => normalizeString(data.value.id),
    getType: (data) => data.type,
    enforcedTargetId,
  })
  const kitchenId = computed(() => normalizeString(selectedId.value))
  const resolvedSelectedData = computed<WorkspaceData<KitchenSurface> | null>(
    () => {
      const data = selectedData.value
      if (
        !data ||
        data.type !== 'live' ||
        normalizeString(data.value.id) !== kitchenId.value
      ) {
        return null
      }
      return data
    }
  )
  const dataType = computed<WorkspaceDataType | null>(
    () => resolvedSelectedData.value?.type ?? null
  )
  const selectedKitchenTarget = computed<KitchenWorkspaceEntity | null>(
    () => resolvedSelectedData.value?.value ?? null
  )
  const { setAuthority, clearAuthority } = useWorkspaceDataAuthority('kitchen')
  watch(
    () => ({
      id: normalizeString(selectedKitchenTarget.value?.id),
      dataType: dataType.value,
    }),
    ({
      id,
      dataType: resolvedDataType,
    }: {
      id: string
      dataType: WorkspaceDataType | null
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
    resolveWorkspaceEntityAppId(
      selectedKitchenTarget.value,
      workspaceRoot.appId
    )
  )
  const databaseId = computed(() => readRuntimeFirestoreDatabaseId() || '')
  const firestore = useWorkspaceEntityFirestore({
    family: 'kitchens',
    target: selectedKitchenTarget,
    appId: scopedAppId,
    mode: dataType,
    active: computed(() => Boolean(dataType.value)),
    testCollectionPath: 'kitchens',
    useAppSupport: false,
  })
  const kitchenCollectionPath = firestore.writeCollection
  const liveScopedKitchenId = computed(() =>
    dataType.value === 'live' ? kitchenId.value : ''
  )
  const { kitchen: scopedKitchen } = useKitchenFetch(liveScopedKitchenId, {
    collectionPath: kitchenCollectionPath,
    hydrate: false,
  })
  const selectedKitchen = computed<KitchenWorkspaceEntity | null>(() =>
    dataType.value === 'live'
      ? composeWorkspaceKitchen(
          selectedKitchenTarget.value,
          scopedKitchen.value as KitchenWorkspaceEntity | null
        )
      : selectedKitchenTarget.value
  )
  const storageKitchenId = kitchenId
  const readOnly = computed(() => dataType.value !== 'live')
  const canWrite = computed(
    () => !readOnly.value && selectedKitchenTarget.value?.can_write === true
  )
  const clearSelectedKitchen = () => clearSelection()
  const selectKitchen = (kitchenId: string) => selectTarget(kitchenId, 'live')
  const selection = {
    kitchen: selectedKitchen,
    kitchenId,
    kitchenSource,
    hasSelection: computed(() => Boolean(resolvedSelectedData.value)),
  }
  const runtime = {
    appId: firestore.appId,
    source: kitchenSource,
    dataType,
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
    isTenant: computed(() => workspaceRoot.isTenant),
    isGlobal: computed(() => workspaceRoot.isGlobal),
    readOnly,
    canWrite,
    canCreate: computed(() => workspaceRoot.canCreateTarget()),
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

export function useKitchenWorkspace() {
  return useWorkspaceFamilyRuntime('kitchen', createKitchenWorkspace)
}
