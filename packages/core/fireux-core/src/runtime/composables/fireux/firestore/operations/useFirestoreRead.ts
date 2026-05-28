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
import { computed, ref, unref, watch, type Ref } from 'vue'
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
  binding: { promise?: Ref<Promise<unknown>> },
  context: string
) {
  const promise = binding.promise?.value
  if (!promise || typeof promise.catch !== 'function') return

  promise.catch((error) => {
    if (import.meta.dev) {
      if (isOfflineFirestoreError(error)) {
        console.warn(`[useFirestoreRead] offline read ignored (${context})`, error)
        return
      }
      console.error(`[useFirestoreRead] read failed (${context})`, error)
    }
  })
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
  ): Ref<T[] | undefined> => {
    if (import.meta.server) {
      return ref(undefined) as Ref<T[] | undefined>
    }

    const resolvedSsrKey = typeof ssrKey === 'string' ? ssrKey : ''
    const options = resolvedSsrKey ? { ssrKey: resolvedSsrKey } : undefined
    const binding = useCollection<T>(q, {
      ...options,
      transform: (docSnap: QueryDocumentSnapshot<T>) => {
        const value = { ...(docSnap.data() as T), id: docSnap.id } as T & Record<string, unknown>
        const resolvedDevCollectionPath = unref(devCollectionPath) || ''
        return resolvedDevCollectionPath
          ? attachDevCollectionMeta(value, resolvedDevCollectionPath, docSnap.id) as T
          : value as T
      },
    } as any)
    guardFirestorePromise(binding as any, resolvedSsrKey || 'query')
    return (binding as any).data as Ref<T[] | undefined>
  }

  /** Fetch an entire collection (reactive) */
  const firestoreFetchCollection = <T>(
    collectionPath: string | Ref<string | null | undefined>
  ): Ref<T[] | undefined> => {
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
  ): Ref<T | undefined> => {
    if (import.meta.server) {
      return ref(undefined) as Ref<T | undefined>
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
    return (binding as any).data as Ref<T | undefined>
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
  } => {
    const docs = ref<T[] | undefined>(undefined) as Ref<T[] | undefined>
    const pending = ref(false)
    let requestId = 0

    const normalizedCollectionPath = computed(() =>
      String(unref(collectionPath) || '').trim()
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

    watch(
      () => ({
        collectionPath: normalizedCollectionPath.value,
        ids: normalizedIds.value,
      }),
      async ({ collectionPath, ids }: { collectionPath: string; ids: string[] }) => {
        const currentRequestId = ++requestId

        if (!collectionPath || !ids.length || import.meta.server) {
          docs.value = []
          pending.value = false
          return
        }

        pending.value = true

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
        } catch (error) {
          if (import.meta.dev) {
            if (isOfflineFirestoreError(error)) {
              console.warn(
                `[useFirestoreRead] offline exact-doc read ignored (${collectionPath})`,
                error
              )
            } else {
              console.error(
                `[useFirestoreRead] exact-doc read failed (${collectionPath})`,
                error
              )
            }
          }
          if (currentRequestId === requestId) docs.value = []
        } finally {
          if (currentRequestId === requestId) pending.value = false
        }
      },
      { immediate: true, deep: true }
    )

    return {
      docs,
      pending,
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
    firestoreLoadDocsByIds,
    firestoreQuery,
    firestorePrefixSearch,
  }
}
