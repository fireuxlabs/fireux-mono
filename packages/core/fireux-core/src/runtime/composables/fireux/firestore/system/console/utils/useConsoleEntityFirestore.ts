import { computed, unref, type MaybeRef } from 'vue'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { AppStorage } from '../../../../../../models/core/app.model'
import {
  consoleEntityUsesAppScope,
  resolveConsoleEntityAppId,
  resolveConsoleEntityCollectionPath,
  resolveConsoleEntityScopeState,
  type ConsoleEntityCollectionFamily,
  type ConsoleEntityRuntimeMode,
  type ConsoleEntityScopeTarget,
} from './resolveConsoleEntityCollectionPath'

export type UseConsoleEntityFirestoreOptions = {
  family: MaybeRef<ConsoleEntityCollectionFamily>
  mode?: MaybeRef<ConsoleEntityRuntimeMode | null | undefined>
  appId?: MaybeRef<string | null | undefined>
  target?: MaybeRef<ConsoleEntityScopeTarget | null | undefined>
  explicitPath?: MaybeRef<string | null | undefined>
  testCollectionPath?: MaybeRef<string | null | undefined>
  useAppOverlay?: MaybeRef<boolean | null | undefined>
}

const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')

const resolveMode = (value: unknown): ConsoleEntityRuntimeMode => {
  const mode = text(value)
  if (mode === 'demo' || mode === 'test') return mode
  return 'live'
}

const appScopedCollection = (family: string, appId: string) =>
  appId ? `${AppStorage.collection}/${appId}/${family}` : ''

export function useConsoleEntityFirestore(
  options: UseConsoleEntityFirestoreOptions
) {
  const fireux = useFireUXConfig()
  const family = computed(() => text(unref(options.family)))
  const target = computed(() => unref(options.target) ?? null)
  const mode = computed(() => resolveMode(unref(options.mode)))
  const appId = computed(
    () =>
      text(unref(options.appId)) ||
      resolveConsoleEntityAppId(target.value, fireux.appId)
  )
  const scopeState = computed(() =>
    resolveConsoleEntityScopeState(target.value)
  )
  const isAppScoped = computed(() =>
    consoleEntityUsesAppScope(target.value)
  )
  const isTenantOwned = computed(() => scopeState.value === 'tenant_app')
  const shouldUseAppScope = computed(
    () => Boolean(unref(options.useAppOverlay)) || isAppScoped.value
  )
  const rootCollection = computed(() => {
    const testPath = text(unref(options.testCollectionPath))
    return resolveConsoleEntityCollectionPath({
      family: family.value,
      mode: mode.value,
      explicitPath: mode.value === 'test' ? testPath : undefined,
    })
  })
  const scopedCollection = computed(() => {
    if (mode.value !== 'live') return ''
    return appScopedCollection(family.value, appId.value)
  })
  const collectionPath = computed(() => {
    if (mode.value === 'demo') return ''

    const explicitPath = text(unref(options.explicitPath))
    if (explicitPath) return explicitPath
    if (mode.value !== 'live') return rootCollection.value
    if (shouldUseAppScope.value && scopedCollection.value) {
      return scopedCollection.value
    }

    return rootCollection.value
  })

  return {
    appId,
    collectionPath,
    isAppScoped,
    isTenantOwned,
    mode,
    readCollection: collectionPath,
    rootCollection,
    scopedCollection,
    scopeState,
    usesAppOverlay: shouldUseAppScope,
    writeCollection: collectionPath,
  }
}
