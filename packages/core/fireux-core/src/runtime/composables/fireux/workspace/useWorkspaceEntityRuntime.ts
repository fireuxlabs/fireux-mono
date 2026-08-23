// Concurrent edit — 2026-07-20 16:14 CEST — Workspace Spine pass: carry authoritative target outcomes into selection.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose App support collection selection directly.
import { computed, unref, watch, type MaybeRef } from 'vue'
import { normalizeString } from '../../../utils/string'
import { useAuth } from '../firebase/useAuth'
import { useWorkspaceEntityFirestore } from '../firestore/system/workspace/utils/useWorkspaceEntityFirestore'
import type {
  WorkspaceEntityCollectionFamily,
  WorkspaceEntityRuntimeMode,
  WorkspaceEntityScopeTarget,
} from '../firestore/system/workspace/utils/resolveWorkspaceEntityCollectionPath'
import { targetHasOperator } from './useWorkspaceAccess'
import { type WorkspaceData, type WorkspaceDataType } from './useWorkspaceData'
import { useWorkspaceDataAuthority } from './useWorkspaceDataAuthority'
import { normalizeWorkspaceSource, useWorkspace } from './useWorkspace'
import type { WorkspaceTargetOutcome } from './useWorkspaceDirectoryIndex'
import { useWorkspaceSelection } from './useWorkspaceSelection'

type ValueRef<T> = MaybeRef<T>

export type UseWorkspaceEntityRuntimeOptions<TTarget extends object> = {
  family: string
  storageFamily: ValueRef<WorkspaceEntityCollectionFamily>
  targetData: ValueRef<
    (WorkspaceData<TTarget> | null | undefined)[] | null | undefined
  >
  targetOutcome: ValueRef<WorkspaceTargetOutcome>
  getId: (target: TTarget) => string
  appId?: ValueRef<string | null | undefined>
  mode?: ValueRef<WorkspaceEntityRuntimeMode | null | undefined>
  explicitPath?: ValueRef<string | null | undefined>
  testCollectionPath?: ValueRef<string | null | undefined>
  useAppSupport?: ValueRef<boolean | null | undefined>
  readOnly?: ValueRef<boolean | null | undefined>
  userId?: ValueRef<string | null | undefined>
  enforcedTargetId?: ValueRef<string | null | undefined>
}

export function useWorkspaceEntityRuntime<TTarget extends object>(
  options: UseWorkspaceEntityRuntimeOptions<TTarget>
) {
  const workspaceRoot = useWorkspace(options.family)
  const source = computed(() => {
    const explicitMode = normalizeString(unref(options.mode))
    return explicitMode
      ? normalizeWorkspaceSource(explicitMode)
      : workspaceRoot.source.value
  })
  const { uid } = useAuth()
  const userId = computed(
    () => normalizeString(unref(options.userId)) || normalizeString(uid.value)
  )
  const targetData = computed<Array<WorkspaceData<TTarget>>>(() =>
    (unref(options.targetData) ?? []).filter(
      (data): data is WorkspaceData<TTarget> => data != null
    )
  )
  const {
    selectedId,
    selectedTarget: selectedData,
    selectTarget,
    clearSelection,
  } = useWorkspaceSelection<WorkspaceData<TTarget>>(options.family, {
    targetItems: targetData,
    targetOutcome: computed(() => unref(options.targetOutcome)),
    getId: (data) => options.getId(data.value),
    getType: (data) => data.type,
    enforcedTargetId: options.enforcedTargetId,
  })
  const selectedTarget = computed<TTarget | null>(
    () => selectedData.value?.value ?? null
  )
  const dataType = computed<WorkspaceDataType | null>(() =>
    selectedData.value?.type === source.value ? selectedData.value.type : null
  )
  const dataAuthority = useWorkspaceDataAuthority(options.family)
  watch(
    () => ({
      id: selectedData.value
        ? normalizeString(options.getId(selectedData.value.value))
        : '',
      type: dataType.value,
    }),
    ({ id, type }: { id: string; type: WorkspaceDataType | null }) =>
      dataAuthority.setAuthority(id, type),
    { immediate: true }
  )
  const isDemo = computed(() => dataType.value === 'demo')

  const entityId = computed(() => {
    const target = selectedTarget.value
    return normalizeString(target ? options.getId(target) : selectedId.value)
  })
  const firestore = useWorkspaceEntityFirestore({
    family: options.storageFamily,
    target: computed(
      () => selectedTarget.value as WorkspaceEntityScopeTarget | null
    ),
    appId: computed(
      () => normalizeString(unref(options.appId)) || workspaceRoot.appId
    ),
    mode: dataType,
    active: computed(() => Boolean(dataType.value)),
    explicitPath: options.explicitPath,
    testCollectionPath: options.testCollectionPath,
    useAppSupport: options.useAppSupport,
  })
  const readOnly = computed(
    () => !dataType.value || isDemo.value || Boolean(unref(options.readOnly))
  )
  const canWrite = computed(
    () =>
      !readOnly.value && targetHasOperator(selectedTarget.value, userId.value)
  )
  const rootCollection = firestore.writeCollection

  return {
    workspaceRoot,
    userId,
    selection: {
      selectedId,
      selectedTarget,
      entityId,
      hasSelection: computed(() => Boolean(entityId.value)),
    },
    runtime: {
      appId: firestore.appId,
      ecosystem: computed(() => workspaceRoot.ecosystem),
      canonicalRootCollection: firestore.rootCollection,
      collectionPath: firestore.collectionPath,
      isTenantOwned: firestore.isTenantOwned,
      rootCollection,
      scopeState: firestore.scopeState,
      appSupportCollection: firestore.appSupportCollection,
      usesAppSupport: firestore.usesAppSupport,
      writeCollection: firestore.writeCollection,
      source,
      dataType,
      isDemo,
      readOnly,
      canWrite,
    },
    actions: {
      selectTarget,
      clearSelection,
    },
  }
}
