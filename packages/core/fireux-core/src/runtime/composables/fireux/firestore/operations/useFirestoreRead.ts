import {
  collection,
  doc,
  endAt,
  limit as fslimit,
  query as fsq,
  getDocs,
  orderBy,
  startAt,
  type DocumentSnapshot,
  type Query,
  type QueryDocumentSnapshot,
} from 'firebase/firestore'
import { ref, type Ref } from 'vue'
import {
  useCollection,
  useDocument,
  useFirestoreResolver,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { attachDevCollectionMeta } from 'fireux-core/runtime/composables/dev/useDevCollectionJson'

type UseFirestoreReadOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
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
    q: Query<T>,
    ssrKey?: string,
    devCollectionPath?: string
  ): Ref<T[] | undefined> => {
    if (import.meta.server) {
      return ref(undefined) as Ref<T[] | undefined>
    }

    const options = ssrKey ? { ssrKey } : undefined
    const binding = useCollection<T>(q, {
      ...options,
      transform: (docSnap: QueryDocumentSnapshot<T>) => {
        const value = { ...(docSnap.data() as T), id: docSnap.id } as T & Record<string, unknown>
        return devCollectionPath
          ? attachDevCollectionMeta(value, devCollectionPath, docSnap.id) as T
          : value as T
      },
    } as any)
    guardFirestorePromise(binding as any, ssrKey || 'query')
    return (binding as any).data as Ref<T[] | undefined>
  }

  /** Fetch an entire collection (reactive) */
  const firestoreFetchCollection = <T>(
    collectionPath: string
  ): Ref<T[] | undefined> => {
    const q = fsq(collection(resolveDb(), collectionPath)) as Query<T>
    return firestoreQuery<T>(q, collectionPath, collectionPath)
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
    firestoreQuery,
    firestorePrefixSearch,
  }
}
