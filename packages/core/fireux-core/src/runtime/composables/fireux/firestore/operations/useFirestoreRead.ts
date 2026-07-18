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
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  computed,
  ref,
  unref,
  watch,
  type ComputedRef,
  type Ref,
} from 'vue'
import {
  useCollection,
  useDocument,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'

type UseFirestoreReadOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

type MaybeRef<T> = T | Ref<T>

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

type FirestoreLoadDocsByIdsOptions = {
  collectionPath: string | Ref<string | null | undefined>
  ids: MaybeRef<(string | number | null | undefined)[] | null | undefined>
}

function isOfflineFirestoreError(error: unknown): boolean {
  const code = typeof (error as any)?.code === 'string' ? (error as any).code : ''
  const message = String((error as any)?.message ?? '').toLowerCase()
  return code === 'unavailable' || message.includes('client is offline')
}

function guardFirestorePromise(
  binding: {
    error?: Ref<unknown | undefined>
    promise?: Ref<Promise<unknown> | undefined>
  },
  context: string
) {
  const handled = new WeakSet<Promise<unknown>>()
  const guard = (promise: Promise<unknown> | undefined) => {
    if (!promise || typeof promise.catch !== 'function') return
    if (handled.has(promise)) return
    handled.add(promise)
    if (binding.error) binding.error.value = undefined

    promise.catch((error) => {
      if (import.meta.dev) {
        if (isOfflineFirestoreError(error)) {
          console.warn(
            `[useFirestoreRead] read unavailable while offline (${context})`,
            error
          )
          return
        }
        console.error(`[useFirestoreRead] read failed (${context})`, error)
      }
    })
  }

  if (!binding.promise) return

  watch(binding.promise, guard, { immediate: true, flush: 'sync' })
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
    guardFirestorePromise(binding as any, resolvedSsrKey || 'query')
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
    collectionPath: string,
    docId: string
  ): FirestoreReadRef<T> => {
    if (import.meta.server) {
      return createServerFirestoreRead<T>(true, 'document')
    }

    const docRef = doc(resolveDb(), collectionPath, docId)
    const binding = useDocument(docRef, {
      ssrKey: `${collectionPath}-${docId}`,
      transform: (docSnap: DocumentSnapshot<T>) => {
        const raw = docSnap.data()
        if (!raw) return undefined
        const value = { ...(raw as any), id: docSnap.id } as T & Record<string, unknown>
        return attachDevCollectionMeta(value, collectionPath, docSnap.id) as T
      },
    } as any)
    guardFirestorePromise(
      binding as any,
      `${collectionPath}/${docId}`
    )
    return enhanceFirestoreRead(binding as any, {
      active: true,
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

  /**
   * Load exact documents by id without reading the whole collection.
   * Reloads when collectionPath/ids change, but does not live-listen to doc updates.
   */
  const firestoreLoadDocsByIds = <T>({
    collectionPath,
    ids,
  }: FirestoreLoadDocsByIdsOptions): {
    docs: Ref<T[] | undefined>
    pending: Ref<boolean>
    error: Ref<unknown | undefined>
    outcome: ComputedRef<FirestoreReadOutcome>
  } => {
    const docs = ref<T[] | undefined>(undefined) as Ref<T[] | undefined>
    const pending = ref(false)
    const error = ref<unknown>()
    let requestId = 0

    const normalizedCollectionPath = computed(() =>
      String(unref(collectionPath) || '').trim()
    )
    const normalizedDatabaseId = computed(() =>
      String(unref(options.databaseId) || '').trim()
    )
    const normalizedIds = computed(() => {
      const values = unref(ids) ?? []
      return Array.from(
        new Set(
          values
            .map((value) => String(value ?? '').trim())
            .filter(Boolean)
        )
      )
    })
    const active = computed(() =>
      Boolean(normalizedCollectionPath.value && normalizedIds.value.length)
    )
    const outcome = computed<FirestoreReadOutcome>(() => {
      if (!active.value) return 'idle'
      if (pending.value) return 'pending'
      if (error.value) return 'error'
      return docs.value?.length ? 'ready' : 'empty'
    })

    watch(
      () => ({
        collectionPath: normalizedCollectionPath.value,
        databaseId: normalizedDatabaseId.value,
        ids: normalizedIds.value,
      }),
      async ({ collectionPath, ids }: {
        collectionPath: string
        databaseId: string
        ids: string[]
      }) => {
        const currentRequestId = ++requestId

        if (!collectionPath || !ids.length) {
          docs.value = []
          pending.value = false
          error.value = undefined
          return
        }

        if (import.meta.server) {
          docs.value = undefined
          pending.value = true
          error.value = undefined
          return
        }

        docs.value = undefined
        pending.value = true
        error.value = undefined

        try {
          const snapshots = await Promise.all(
            ids.map((id: string) => getDoc(doc(resolveDb(), collectionPath, id)))
          )

          if (currentRequestId !== requestId) return

          docs.value = snapshots.reduce<T[]>((acc, docSnap) => {
            const raw = docSnap.data()
            if (!raw) return acc

            const value = {
              ...(raw as Record<string, unknown>),
              id: docSnap.id,
            } as unknown as T & Record<string, unknown>

            acc.push(attachDevCollectionMeta(value, collectionPath, docSnap.id) as T)
            return acc
          }, [])
        } catch (failure) {
          if (import.meta.dev) {
            if (isOfflineFirestoreError(failure)) {
              console.warn(
                `[useFirestoreRead] exact-doc read unavailable while offline (${collectionPath})`,
                failure
              )
            } else {
              console.error(
                `[useFirestoreRead] exact-doc read failed (${collectionPath})`,
                failure
              )
            }
          }
          if (currentRequestId === requestId) {
            docs.value = undefined
            error.value = failure
          }
        } finally {
          if (currentRequestId === requestId) pending.value = false
        }
      },
      { immediate: true, deep: true }
    )

    return {
      docs,
      pending,
      error,
      outcome,
    }
  }

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
