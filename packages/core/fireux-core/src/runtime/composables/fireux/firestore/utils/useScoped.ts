import { computed, unref, type ComputedRef, type Ref } from 'vue'
import { useDocument, useFirestore } from 'vuefire'
import {
  doc,
  type DocumentData,
  type DocumentReference,
  type Firestore,
} from 'firebase/firestore'
import { useFireUXConfig } from '../../app/FireUXConfig'
import { useFirestoreRead } from '../operations/useFirestoreRead'

type PathBuilder = (appId: string) => string
export type MaybeRef<T> = T | Ref<T>

export interface ScopedCollectionOptions {
  corePath: string
  appPath: PathBuilder
}

export interface ScopedCollectionState<TCore, TApp> {
  collection: ComputedRef<TCore[] | TApp[]>
  loading: ComputedRef<boolean>
  local: Ref<TApp[] | undefined> | null
  global: Ref<TCore[] | undefined> | null
  context: {
    isTenant: boolean
    appId: string | null | undefined
  }
}

export interface ScopedDocProjectorInput<TCore, TApp> {
  core: TCore | null | undefined
  app: TApp | null | undefined
  isTenant: boolean
  appId: string | null
}

export type ScopedDocProjector<TCore, TApp, TResult> = (
  input: ScopedDocProjectorInput<TCore, TApp>
) => TResult

export interface ScopedDocOptions<TCore, TApp, TResult> {
  id: MaybeRef<string | null | undefined>
  corePath: string
  appPath: PathBuilder
  projector?: ScopedDocProjector<TCore, TApp, TResult>
}

export type ScopedDocValue<TCore, TApp> = TCore | TApp | null

export interface ScopedDocState<TCore, TApp> {
  value: ComputedRef<ScopedDocValue<TCore, TApp>>
  core: ComputedRef<TCore | undefined>
  app: ComputedRef<TApp | undefined>
  loading: ComputedRef<boolean>
  context: {
    isTenant: boolean
    appId: string | null | undefined
  }
}

export function useScopedCollection<TCore, TApp>(
  opts: ScopedCollectionOptions
): ScopedCollectionState<TCore, TApp> {
  const { isTenant, appId } = useFireUXConfig()
  const { firestoreFetchCollection } = useFirestoreRead()

  const local =
    isTenant && appId
      ? firestoreFetchCollection<TApp>(opts.appPath(appId))
      : null

  const global = isTenant
    ? null
    : firestoreFetchCollection<TCore>(opts.corePath)

  const collection = computed<TCore[] | TApp[]>(() => {
    const localValue = local?.value
    if (localValue) return localValue

    const globalValue = global?.value
    if (globalValue) return globalValue

    return [] as TCore[] | TApp[]
  })

  const loading = computed(() => {
    if (local) return local.value === undefined
    if (global) return global.value === undefined
    return false
  })

  return {
    collection,
    loading,
    local,
    global,
    context: { isTenant, appId } as const,
  }
}

export function useScopedDoc<
  TCore,
  TApp,
  TResult = ScopedDocValue<TCore, TApp>
>(opts: ScopedDocOptions<TCore, TApp, TResult>) {
  const { isTenant, appId } = useFireUXConfig()
  const db = useFirestore()

  const idRef = computed(() => {
    const id = unref(opts.id)
    return id && id.length > 0 ? id : null
  })

  const coreRef = computed<DocumentReference<DocumentData> | null>(() => {
    const id = idRef.value
    if (!id) return null
    return doc(db, opts.corePath, id)
  })
  const { data: coreData, pending: corePending } = useDocument(coreRef)
  const core = computed(() => coreData.value as TCore | undefined)

  const appRef = computed<DocumentReference<DocumentData> | null>(() => {
    const id = idRef.value
    if (!id || !isTenant || !appId) return null
    return doc(db, opts.appPath(appId), id)
  })
  const { data: appData, pending: appPending } = useDocument(appRef)
  const app = computed(() => appData.value as TApp | undefined)

  const projector =
    opts.projector ??
    ((payload: ScopedDocProjectorInput<TCore, TApp>) =>
      (payload.isTenant
        ? payload.app ?? null
        : payload.core ?? null) as TResult)

  const value = computed<TResult>(() => {
    const id = idRef.value
    if (!id) return null as TResult

    return projector({
      core: core.value ?? null,
      app: app.value ?? null,
      isTenant,
      appId: appId ?? null,
    })
  })

  const loading = computed(() => {
    if (!idRef.value) return false
    if (corePending?.value) return true
    if (isTenant && appId) return Boolean(appPending?.value)
    return false
  })

  return {
    value,
    loading,
    core,
    app,
    context: { isTenant, appId } as const,
  }
}

export function getScopedDoc<TCore, TApp>(
  db: Firestore,
  uid: Ref<string | null | undefined>,
  isTenant: boolean,
  appId: string | null | undefined,
  coreCollection: string,
  appCollection: string
): ScopedDocState<TCore, TApp> {
  const coreRef = computed<DocumentReference<DocumentData> | null>(() => {
    const id = uid.value ?? null
    if (!id) return null
    return doc(db, coreCollection, id)
  })
  const { data: coreData, pending: corePending } = useDocument(coreRef)
  const coreDoc = computed(() => coreData.value as TCore | undefined)

  const appRef = computed<DocumentReference<DocumentData> | null>(() => {
    const id = uid.value ?? null
    if (!id || !isTenant || !appId) return null
    return doc(db, `apps/${appId}/${appCollection}`, id)
  })
  const { data: appData, pending: appPending } = useDocument(appRef)
  const appDoc = computed(() => appData.value as TApp | undefined)

  const value = computed<ScopedDocValue<TCore, TApp>>(() => {
    const id = uid.value ?? null
    if (!id) return null

    if (isTenant && appId) return appDoc.value ?? null

    return coreDoc.value ?? null
  })

  const loading = computed(() => {
    const id = uid.value ?? null
    if (!id) return false
    if (corePending?.value) return true
    if (isTenant && appId) return Boolean(appPending?.value)
    return false
  })

  return {
    value,
    core: coreDoc,
    app: appDoc,
    loading,
    context: {
      isTenant,
      appId: appId ?? null,
    },
  }
}
