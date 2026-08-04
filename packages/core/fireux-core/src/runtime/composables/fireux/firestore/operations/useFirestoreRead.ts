import {
  collection,
  doc,
  endAt,
  limit as fslimit,
  query as fsq,
  getDocs,
  getDoc,
  orderBy,
  startAt,
  type DocumentReference,
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  computed,
  ref,
  unref,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  readRuntimeFirestoreDatabaseId,
  useCollection,
  useDocument,
  useFirestoreResolver,
} from '../vuefire'
import { attachDevCollectionMeta } from '../../../dev/useDevCollectionJson'
import {
  createFirestoreExactDocLoader,
  type FirestoreLoadDocsByIdsOptions,
} from './firestore-exact-doc-loader'
import { guardFirestorePromise } from './firestore-read-errors'

type UseFirestoreReadOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

export type FirestoreDocSource =
  | string
  | Ref<string | null | undefined>
  | null
  | undefined

export type FirestoreFetchDocOptions = {
  ssrKey?: string
}

export type FirestoreReadOutcome =
  | 'idle'
  | 'pending'
  | 'error'
  | 'empty'
  | 'missing'
  | 'ready'

export type FirestoreReadRef<T> = Ref<T | undefined> & {
  readonly data: Ref<T | undefined>
  readonly error: Ref<unknown | undefined>
  readonly pending: Ref<boolean>
  readonly promise: Ref<Promise<unknown> | undefined>
  readonly outcome: ComputedRef<FirestoreReadOutcome>
  readonly stop: (reset?: boolean | (() => unknown)) => void
}

function enhanceFirestoreRead<T>(
  binding: Omit<FirestoreReadRef<T>, 'outcome'>,
  options: {
    active: boolean | Ref<boolean>
    kind: 'collection' | 'document'
  }
): FirestoreReadRef<T> {
  const outcome = computed<FirestoreReadOutcome>(() => {
    if (!unref(options.active)) return 'idle'
    if (binding.pending.value) return 'pending'
    if (binding.error.value) return 'error'

    if (options.kind === 'collection') {
      const entries = binding.value
      return Array.isArray(entries) && entries.length ? 'ready' : 'empty'
    }

    return binding.value == null ? 'missing' : 'ready'
  })

  Object.defineProperty(binding, 'outcome', {
    get: () => outcome,
  })

  return binding as FirestoreReadRef<T>
}

function createServerFirestoreRead<T>(
  active: boolean | Ref<boolean>,
  kind: 'collection' | 'document'
): FirestoreReadRef<T> {
  const data = ref<T | undefined>(undefined) as Ref<T | undefined>
  const error = ref<unknown>()
  const pending = computed(() => Boolean(unref(active)))
  const promise = ref<Promise<unknown>>()
  const binding = Object.defineProperties(data, {
    data: { get: () => data },
    error: { get: () => error },
    pending: { get: () => pending },
    promise: { get: () => promise },
    stop: { get: () => () => undefined },
  }) as Omit<FirestoreReadRef<T>, 'outcome'>

  return enhanceFirestoreRead(binding, { active, kind })
}

/**
 * Unified Firestore read composable for FireUX.
 * Covers single docs, full collections, and common query patterns.
 */
export function useFirestoreRead(options: UseFirestoreReadOptions = {}) {
  const resolveDb = useFirestoreResolver(options.databaseId)

  /** Run any Firestore Query (reactive) */
  const firestoreQuery = <T>(
    q: Query<T> | Ref<Query<T> | null>,
    ssrKey?: string | Ref<string>,
    devCollectionPath?: string | Ref<string>
  ): FirestoreReadRef<T[]> => {
    const active = computed(() => Boolean(unref(q)))

    if (import.meta.server) {
      return createServerFirestoreRead<T[]>(active, 'collection')
    }

    const resolvedSsrKey = typeof ssrKey === 'string' ? ssrKey : ''
    const options = resolvedSsrKey ? { ssrKey: resolvedSsrKey } : undefined
    const binding = useCollection<T>(q, {
      ...options,
      reset: true,
      transform: (docSnap: QueryDocumentSnapshot<T>) => {
        const value = { ...(docSnap.data() as T), id: docSnap.id } as T & Record<string, unknown>
        const resolvedDevCollectionPath = unref(devCollectionPath) || ''
        return resolvedDevCollectionPath
          ? attachDevCollectionMeta(value, resolvedDevCollectionPath, docSnap.id) as T
          : value as T
      },
    } as any)
    const context = computed(
      () =>
        resolvedSsrKey ||
        String(unref(devCollectionPath) || '').trim() ||
        'query'
    )
    guardFirestorePromise(binding as any, context)
    return enhanceFirestoreRead(binding as any, {
      active,
      kind: 'collection',
    })
  }

  /** Fetch an entire collection (reactive) */
  const firestoreFetchCollection = <T>(
    collectionPath: string | Ref<string | null | undefined>
  ): FirestoreReadRef<T[]> => {
    if (typeof collectionPath === 'string') {
      const q = fsq(collection(resolveDb(), collectionPath)) as Query<T>
      return firestoreQuery<T>(q, collectionPath, collectionPath)
    }

    const resolvedCollectionPath = computed(() =>
      String(unref(collectionPath) || '').trim()
    )
    const q = computed(() => {
      const path = resolvedCollectionPath.value
      return path ? fsq(collection(resolveDb(), path)) as Query<T> : null
    })

    return firestoreQuery<T>(q, undefined, resolvedCollectionPath)
  }

  /** Fetch a single document (reactive) */
  const firestoreFetchDoc = <T>(
    collectionPath: FirestoreDocSource,
    docId: FirestoreDocSource,
    readOptions: FirestoreFetchDocOptions = {}
  ): FirestoreReadRef<T> => {
    const resolvedCollectionPath = computed(() =>
      String(unref(collectionPath) || '').trim()
    )
    const resolvedDocId = computed(() => String(unref(docId) || '').trim())
    const active = computed(() =>
      Boolean(resolvedCollectionPath.value && resolvedDocId.value)
    )
    const documentRef = computed<DocumentReference<T> | null>(() => {
      const path = resolvedCollectionPath.value
      const id = resolvedDocId.value
      return path && id
        ? doc(resolveDb(), path, id) as DocumentReference<T>
        : null
    })

    if (import.meta.server) {
      return createServerFirestoreRead<T>(active, 'document')
    }

    const initialCollectionPath = resolvedCollectionPath.value
    const initialDocId = resolvedDocId.value
    const initialDatabaseId = String(
      unref(options.databaseId) || readRuntimeFirestoreDatabaseId() || ''
    ).trim() || '(default)'
    const initialSsrIdentity = readOptions.ssrKey
      || (initialCollectionPath && initialDocId
        ? `${initialCollectionPath}/${initialDocId}`
        : '')
    const ssrKey = initialSsrIdentity
      ? `fireux-doc:${initialDatabaseId}:${initialSsrIdentity}`
      : undefined
    const binding = useDocument(documentRef, {
      ...(ssrKey ? { ssrKey } : {}),
      reset: () => undefined,
      transform: (docSnap: DocumentSnapshot<T>) => {
        const raw = docSnap.data()
        if (!raw) return undefined
        const value = { ...(raw as any), id: docSnap.id } as T & Record<string, unknown>
        return attachDevCollectionMeta(
          value,
          docSnap.ref.parent.path,
          docSnap.id
        ) as T
      },
    } as any)
    const context = computed(() => {
      const path = resolvedCollectionPath.value
      const id = resolvedDocId.value
      const databaseId = String(
        unref(options.databaseId) || readRuntimeFirestoreDatabaseId() || ''
      ).trim() || '(default)'
      return path && id
        ? `${databaseId}:${path}/${id}`
        : `${databaseId}:document`
    })
    guardFirestorePromise(
      binding as any,
      context
    )
    return enhanceFirestoreRead(binding as any, {
      active,
      kind: 'document',
    })
  }

  /** Read a single document once without creating a live subscription. */
  const firestoreGetDoc = async <T>(
    collectionPath: string,
    docId: string
  ): Promise<T | undefined> => {
    const docSnap = await getDoc(doc(resolveDb(), collectionPath, docId))
    const raw = docSnap.data()
    if (!raw) return undefined

    const value = {
      ...(raw as Record<string, unknown>),
      id: docSnap.id,
    } as unknown as T & Record<string, unknown>

    return attachDevCollectionMeta(value, collectionPath, docSnap.id) as T
  }

  /** Load exact documents by id without listing the whole collection. */
  const firestoreLoadDocsByIds = <T>(
    loadOptions: FirestoreLoadDocsByIdsOptions
  ) =>
    createFirestoreExactDocLoader<T>({
      resolveDb,
      databaseId: options.databaseId,
      options: loadOptions,
    })

  /**
   * Convenience prefix search for “starts with” text fields.
   * Requires the field to be indexed and (ideally) lowercased.
   */
  const firestorePrefixSearch = async <T>(
    collectionPath: string,
    field: keyof T & string,
    value: string,
    max = 10
  ): Promise<T[]> => {
    const q = fsq(
      collection(resolveDb(), collectionPath),
      orderBy(field),
      startAt(value),
      endAt(value + '\uf8ff'),
      fslimit(max)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map((docSnap) => docSnap.data() as T)
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
    firestoreGetDoc,
    firestoreLoadDocsByIds,
    firestoreQuery,
    firestorePrefixSearch,
  }
}
