import {
  resolveReadOutcome,
  type ReadOutcome,
} from '../../../../utils/read-outcome'
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
  type QueryConstraint,
} from 'firebase/firestore'
import {
  computed,
  ref,
  shallowRef,
  unref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  readRuntimeFirestoreDatabaseId,
  useCollection,
  useDocument,
  useFirestoreResolver,
} from '../vuefire'
import { attachDevCollectionMeta } from '../../../diagnostics/useDiagnosticsCollectionJson'
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

export type FirestoreReadOutcome = ReadOutcome

export type FirestoreReadRef<T> = Ref<T | undefined> & {
  readonly data: Ref<T | undefined>
  readonly error: Ref<unknown | undefined>
  readonly pending: Ref<boolean>
  readonly promise: Ref<Promise<unknown> | undefined>
  readonly outcome: ComputedRef<FirestoreReadOutcome>
  readonly stop: (reset?: boolean | (() => unknown)) => void
}

export type FirestoreDocumentReadRef<T> = Omit<
  FirestoreReadRef<T>,
  'outcome'
> & {
  readonly outcome: ComputedRef<FirestoreReadOutcome>
}

function enhanceFirestoreRead<T>(
  binding: Omit<FirestoreReadRef<T>, 'outcome'>,
  options: {
    active: boolean | Ref<boolean>
    kind: 'collection' | 'document'
    source?: unknown
  }
): FirestoreReadRef<T> {
  // VueFire rebinds on the next Vue watch flush. Hide the old scope immediately
  // and accept the new scope only when VueFire installs its new read promise.
  const boundSource = shallowRef(unref(options.source))
  const stopSourceWatch = options.source
    ? watch(
        binding.promise,
        () => {
          // VueFire retains the previous binding error when it starts a new read.
          binding.error.value = undefined
          boundSource.value = unref(options.source)
        },
        { flush: 'sync' }
      )
    : undefined
  const current = computed(() => unref(options.source) === boundSource.value)
  const outcome = computed<FirestoreReadOutcome>(() => {
    if (!unref(options.active)) return 'idle'
    if (!current.value) return 'pending'
    return resolveReadOutcome({
      enabled: Boolean(unref(options.active)),
      failed: Boolean(binding.error.value),
      pending: binding.pending.value,
      present:
        options.kind === 'collection'
          ? Array.isArray(binding.value) && binding.value.length > 0
          : binding.value != null,
    })
  })

  // VueFire may retain its last value after failure or while changing sources.
  // Present one read contract without modifying its subscription or cache.
  const data = computed(() => {
    const state = outcome.value
    return state === 'idle' || state === 'pending' || state === 'error'
      ? undefined
      : binding.value
  })
  const pending = computed(() => outcome.value === 'pending')
  const error = computed(() =>
    unref(options.active) && current.value ? binding.error.value : undefined
  )
  return Object.assign(data, {
    data,
    pending,
    error,
    outcome,
    promise: binding.promise,
    stop: (reset?: boolean | (() => unknown)) => {
      stopSourceWatch?.()
      binding.stop(reset)
    },
  })
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
      // VueFire uses a Firestore converter, not a transform option. Keep id
      // enumerable so domain projections do not lose document identity.
      converter: {
        toFirestore: (value: T) => value,
        fromFirestore: (docSnap: QueryDocumentSnapshot<T>) => {
          const value = { ...(docSnap.data() as T), id: docSnap.id } as T &
            Record<string, unknown>
          const resolvedDevCollectionPath = unref(devCollectionPath) || ''
          return resolvedDevCollectionPath
            ? (attachDevCollectionMeta(
                value,
                resolvedDevCollectionPath,
                docSnap.id
              ) as T)
            : (value as T)
        },
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
      source: q,
    })
  }

  /** Fetch a live collection, optionally constrained by a reactive query. */
  const firestoreFetchCollection = <T>(
    collectionPath: string | Ref<string | null | undefined>,
    constraints: QueryConstraint[] | Ref<QueryConstraint[]> = []
  ): FirestoreReadRef<T[]> => {
    const resolvedCollectionPath = computed(() =>
      String(unref(collectionPath) || '').trim()
    )
    const q = computed(() => {
      const path = resolvedCollectionPath.value
      return path
        ? (fsq(
            collection(resolveDb(), path),
            ...unref(constraints)
          ) as Query<T>)
        : null
    })

    return firestoreQuery<T>(q, undefined, resolvedCollectionPath)
  }

  /** A bounded live window. Loading more expands the same query, so removals
   * and insertions cannot leave gaps or duplicate records between pages. */
  const firestoreCollectionPage = <T>(
    collectionPath: string | Ref<string | null | undefined>,
    options: {
      pageSize?: number
      constraints?: QueryConstraint[]
      scope?: Ref<string>
    } = {}
  ) => {
    const pageSize = options.pageSize ?? 25
    if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) {
      throw new Error('Firestore page size must be between 1 and 100.')
    }
    const size = ref(pageSize)
    const stopScopeWatch = watch(
      () => [unref(collectionPath), options.scope?.value],
      () => {
        size.value = pageSize
      },
      { flush: 'sync' }
    )
    const source = firestoreFetchCollection<T>(
      collectionPath,
      computed(() => {
        // A different account must rebind even at the same page depth.
        void options.scope?.value
        return [...(options.constraints ?? []), fslimit(size.value + 1)]
      })
    )
    const data = computed(() => source.value?.slice(0, size.value))
    const hasMore = computed(() => (source.value?.length ?? 0) > size.value)
    return {
      data,
      pending: source.pending,
      error: source.error,
      outcome: source.outcome,
      hasMore,
      loadMore: () => {
        if (hasMore.value && !source.pending.value) size.value += pageSize
      },
      stop: () => {
        stopScopeWatch()
        source.stop()
      },
    }
  }

  /** Fetch a single document (reactive) */
  const firestoreFetchDoc = <T>(
    collectionPath: FirestoreDocSource,
    docId: FirestoreDocSource,
    readOptions: FirestoreFetchDocOptions = {}
  ): FirestoreDocumentReadRef<T> => {
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
        ? (doc(resolveDb(), path, id) as DocumentReference<T>)
        : null
    })

    if (import.meta.server) {
      return createServerFirestoreRead<T>(
        active,
        'document'
      ) as FirestoreDocumentReadRef<T>
    }

    const initialCollectionPath = resolvedCollectionPath.value
    const initialDocId = resolvedDocId.value
    const initialDatabaseId =
      String(
        unref(options.databaseId) || readRuntimeFirestoreDatabaseId() || ''
      ).trim() || '(default)'
    const initialSsrIdentity =
      readOptions.ssrKey ||
      (initialCollectionPath && initialDocId
        ? `${initialCollectionPath}/${initialDocId}`
        : '')
    const ssrKey = initialSsrIdentity
      ? `fireux-doc:${initialDatabaseId}:${initialSsrIdentity}`
      : undefined
    const binding = useDocument(documentRef, {
      ...(ssrKey ? { ssrKey } : {}),
      reset: () => undefined,
      converter: {
        toFirestore: (value: T) => value,
        fromFirestore: (docSnap: DocumentSnapshot<T>) => {
          const raw = docSnap.data()
          if (!raw) return undefined
          const value = { ...(raw as any), id: docSnap.id } as T &
            Record<string, unknown>
          return attachDevCollectionMeta(
            value,
            docSnap.ref.parent.path,
            docSnap.id
          ) as T
        },
      },
    } as any)
    const context = computed(() => {
      const path = resolvedCollectionPath.value
      const id = resolvedDocId.value
      const databaseId =
        String(
          unref(options.databaseId) || readRuntimeFirestoreDatabaseId() || ''
        ).trim() || '(default)'
      return path && id
        ? `${databaseId}:${path}/${id}`
        : `${databaseId}:document`
    })
    guardFirestorePromise(binding as any, context)
    return enhanceFirestoreRead(binding as any, {
      active,
      kind: 'document',
      source: documentRef,
    }) as FirestoreDocumentReadRef<T>
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
    firestoreCollectionPage,
    firestoreFetchDoc,
    firestoreGetDoc,
    firestoreLoadDocsByIds,
    firestoreQuery,
    firestorePrefixSearch,
  }
}
