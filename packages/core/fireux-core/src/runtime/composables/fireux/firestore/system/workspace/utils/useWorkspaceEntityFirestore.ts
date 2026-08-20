// Concurrent edit — 2026-07-20 23:46 CEST — App Support Vocabulary Pass: expose App support path selection directly.
import { computed, unref, type MaybeRef } from 'vue'
import { useFireUXConfig } from '../../../../../../app/composables/config/FireUXConfig'
import { AppStorage } from '../../../../../../app/models/app.model.ts'
import {
  workspaceEntityUsesAppScope,
  resolveWorkspaceEntityAppId,
  resolveWorkspaceEntityCollectionPath,
  resolveWorkspaceEntityScopeState,
  type WorkspaceEntityCollectionFamily,
  type WorkspaceEntityRuntimeMode,
  type WorkspaceEntityScopeTarget,
} from './resolveWorkspaceEntityCollectionPath'

export type UseWorkspaceEntityFirestoreOptions = {
  family: MaybeRef<WorkspaceEntityCollectionFamily>
  active?: MaybeRef<boolean | null | undefined>
  mode?: MaybeRef<WorkspaceEntityRuntimeMode | null | undefined>
  appId?: MaybeRef<string | null | undefined>
  target?: MaybeRef<WorkspaceEntityScopeTarget | null | undefined>
  explicitPath?: MaybeRef<string | null | undefined>
  testCollectionPath?: MaybeRef<string | null | undefined>
  useAppSupport?: MaybeRef<boolean | null | undefined>
}

const text = (value: unknown) =>
  String(value ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '')

const resolveMode = (value: unknown): WorkspaceEntityRuntimeMode => {
  const mode = text(value)
  if (mode === 'demo' || mode === 'test') return mode
  return 'live'
}

const appSupportCollectionPath = (family: string, appId: string) =>
  appId ? `${AppStorage.collection}/${appId}/${family}` : ''

export function useWorkspaceEntityFirestore(
  options: UseWorkspaceEntityFirestoreOptions
) {
  const fireux = useFireUXConfig()
  const family = computed(() => text(unref(options.family)))
  const active = computed(
    () => options.active === undefined || Boolean(unref(options.active))
  )
  const target = computed(() => unref(options.target) ?? null)
  const mode = computed(() => resolveMode(unref(options.mode)))
  const appId = computed(
    () =>
      text(unref(options.appId)) ||
      resolveWorkspaceEntityAppId(target.value, fireux.appId)
  )
  const scopeState = computed(() =>
    resolveWorkspaceEntityScopeState(target.value)
  )
  const isAppScoped = computed(() =>
    workspaceEntityUsesAppScope(target.value)
  )
  const isTenantOwned = computed(() => scopeState.value === 'tenant_app')
  const shouldUseAppSupport = computed(
    () => Boolean(unref(options.useAppSupport)) || isAppScoped.value
  )
  const rootCollection = computed(() => {
    const testPath = text(unref(options.testCollectionPath))
    return resolveWorkspaceEntityCollectionPath({
      family: family.value,
      mode: mode.value,
      explicitPath: mode.value === 'test' ? testPath : undefined,
    })
  })
  const appSupportCollection = computed(() => {
    if (!active.value || mode.value !== 'live') return ''
    return appSupportCollectionPath(family.value, appId.value)
  })
  const collectionPath = computed(() => {
    if (!active.value || mode.value === 'demo') return ''

    const explicitPath = text(unref(options.explicitPath))
    if (explicitPath) return explicitPath
    if (mode.value !== 'live') return rootCollection.value
    if (shouldUseAppSupport.value && appSupportCollection.value) {
      return appSupportCollection.value
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
    appSupportCollection,
    scopeState,
    usesAppSupport: shouldUseAppSupport,
    writeCollection: collectionPath,
  }
}
