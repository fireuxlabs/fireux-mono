// Concurrent edit — 2026-07-20 16:14 CEST — Console Spine pass: carry authoritative target outcomes into selection.
// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose App support collection selection directly.
import { computed, unref, watch, type MaybeRef } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useAuth } from '../../firebase/useAuth'
import { useConsoleEntityFirestore } from '../../firestore/system/console/utils/useConsoleEntityFirestore'
import type {
  ConsoleEntityCollectionFamily,
  ConsoleEntityRuntimeMode,
  ConsoleEntityScopeTarget,
} from '../../firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { targetHasOperator } from './useConsoleAccess'
import { type ConsoleData, type ConsoleDataType } from './useConsoleData'
import { useConsoleDataAuthority } from './useConsoleDataAuthority'
import { normalizeConsoleSource, useConsole } from './useConsole'
import type { ConsoleTargetOutcome } from './useConsoleIndex'
import { useConsoleSelection } from './useConsoleSelection'

type ValueRef<T> = MaybeRef<T>

export type UseConsoleEntityRuntimeOptions<TTarget extends object> = {
  family: string
  storageFamily: ValueRef<ConsoleEntityCollectionFamily>
  targetData: ValueRef<
    (ConsoleData<TTarget> | null | undefined)[] | null | undefined
  >
  targetOutcome: ValueRef<ConsoleTargetOutcome>
  getId: (target: TTarget) => string
  appId?: ValueRef<string | null | undefined>
  mode?: ValueRef<ConsoleEntityRuntimeMode | null | undefined>
  explicitPath?: ValueRef<string | null | undefined>
  testCollectionPath?: ValueRef<string | null | undefined>
  useAppSupport?: ValueRef<boolean | null | undefined>
  readOnly?: ValueRef<boolean | null | undefined>
  userId?: ValueRef<string | null | undefined>
}

export function useConsoleEntityRuntime<TTarget extends object>(
  options: UseConsoleEntityRuntimeOptions<TTarget>
) {
  const consoleRoot = useConsole(options.family)
  const source = computed(() => {
    const explicitMode = normalizeString(unref(options.mode))
    return explicitMode
      ? normalizeConsoleSource(explicitMode)
      : consoleRoot.source.value
  })
  const { uid } = useAuth()
  const userId = computed(
    () => normalizeString(unref(options.userId)) || normalizeString(uid.value)
  )
  const targetData = computed<Array<ConsoleData<TTarget>>>(() =>
    (unref(options.targetData) ?? []).filter(
      (data): data is ConsoleData<TTarget> => data != null
    )
  )
  const {
    selectedId,
    selectedTarget: selectedData,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<ConsoleData<TTarget>>(options.family, {
    targetItems: targetData,
    targetOutcome: computed(() => unref(options.targetOutcome)),
    getId: (data) => options.getId(data.value),
    getType: (data) => data.type,
  })
  const selectedTarget = computed<TTarget | null>(
    () => selectedData.value?.value ?? null
  )
  const dataType = computed<ConsoleDataType | null>(() =>
    selectedData.value?.type === source.value ? selectedData.value.type : null
  )
  const dataAuthority = useConsoleDataAuthority(options.family)
  watch(
    () => ({
      id: selectedData.value
        ? normalizeString(options.getId(selectedData.value.value))
        : '',
      type: dataType.value,
    }),
    ({ id, type }: { id: string; type: ConsoleDataType | null }) =>
      dataAuthority.setAuthority(id, type),
    { immediate: true }
  )
  const isDemo = computed(() => dataType.value === 'demo')

  const entityId = computed(() => {
    const target = selectedTarget.value
    return normalizeString(target ? options.getId(target) : selectedId.value)
  })
  const firestore = useConsoleEntityFirestore({
    family: options.storageFamily,
    target: computed(
      () => selectedTarget.value as ConsoleEntityScopeTarget | null
    ),
    appId: computed(
      () => normalizeString(unref(options.appId)) || consoleRoot.appId
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
    consoleRoot,
    userId,
    selection: {
      selectedId,
      selectedTarget,
      entityId,
      hasSelection: computed(() => Boolean(entityId.value)),
    },
    runtime: {
      appId: firestore.appId,
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
