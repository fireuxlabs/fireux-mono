import { computed, unref, type MaybeRef } from 'vue'
import { normalizeString } from '../../../../utils/string'
import { useAuth } from '../../firebase/useAuth'
import {
  useConsoleEntityFirestore,
} from '../../firestore/system/console/utils/useConsoleEntityFirestore'
import type {
  ConsoleEntityCollectionFamily,
  ConsoleEntityRuntimeMode,
  ConsoleEntityScopeTarget,
} from '../../firestore/system/console/utils/resolveConsoleEntityCollectionPath'
import { targetHasOperator } from './useConsoleAccess'
import { useConsole } from './useConsole'
import { useConsoleSelection } from './useConsoleSelection'

type ValueRef<T> = MaybeRef<T>

export type UseConsoleEntityRuntimeOptions<TTarget> = {
  family: string
  storageFamily: ValueRef<ConsoleEntityCollectionFamily>
  targetItems?: ValueRef<(TTarget | null | undefined)[] | null | undefined>
  targetPending?: ValueRef<boolean | null | undefined>
  getId: (target: TTarget) => string
  appId?: ValueRef<string | null | undefined>
  mode?: ValueRef<ConsoleEntityRuntimeMode | null | undefined>
  explicitPath?: ValueRef<string | null | undefined>
  testCollectionPath?: ValueRef<string | null | undefined>
  useAppOverlay?: ValueRef<boolean | null | undefined>
  readOnly?: ValueRef<boolean | null | undefined>
  userId?: ValueRef<string | null | undefined>
}

export function useConsoleEntityRuntime<TTarget>(
  options: UseConsoleEntityRuntimeOptions<TTarget>
) {
  const consoleRoot = useConsole(options.family)
  const { uid } = useAuth()
  const userId = computed(
    () => normalizeString(unref(options.userId)) || normalizeString(uid.value)
  )
  const {
    selectedId,
    selectedTarget,
    selectTarget,
    clearSelection,
  } = useConsoleSelection<TTarget>(options.family, {
    targetItems: computed(() => unref(options.targetItems) ?? []),
    targetPending: computed(() => Boolean(unref(options.targetPending))),
    getId: options.getId,
  })

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
    mode: options.mode,
    explicitPath: options.explicitPath,
    testCollectionPath: options.testCollectionPath,
    useAppOverlay: options.useAppOverlay,
  })
  const readOnly = computed(() => Boolean(unref(options.readOnly)))
  const canWrite = computed(
    () =>
      !readOnly.value &&
      targetHasOperator(selectedTarget.value, userId.value)
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
      scopedCollection: firestore.scopedCollection,
      usesAppOverlay: firestore.usesAppOverlay,
      writeCollection: firestore.writeCollection,
      readOnly,
      canWrite,
    },
    actions: {
      selectTarget,
      clearSelection,
    },
  }
}
