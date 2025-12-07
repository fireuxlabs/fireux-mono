import { useCollection, useDocument, useFirestore } from 'vuefire'
import {
  collection,
  doc,
  query as fsq,
  orderBy,
  startAt,
  endAt,
  limit as fslimit,
  getDocs,
  type Query,
  type QueryDocumentSnapshot,
  type DocumentSnapshot,
} from 'firebase/firestore'
import type { Ref } from 'vue'

/**
 * Unified Firestore read composable for FireUX.
 * Covers single docs, full collections, and common query patterns.
 */
export function useFirestoreRead() {
  const db = useFirestore()

  const attachDocId = <T extends Record<string, any>>(
    record: T | undefined,
    docId: string,
    idField = 'id'
  ): T | undefined => {
    if (!record || typeof record !== 'object') return record
    if (idField in record) return record
    return { ...record, [idField]: docId }
  }

  /** Run any Firestore Query (reactive) */
  const firestoreQuery = <T>(
    q: Query<T>,
    ssrKey?: string
  ): Ref<T[] | undefined> => {
    const options = ssrKey ? { ssrKey } : undefined
    const { data } = useCollection<T>(q, {
      ...options,
      transform: (docSnap: QueryDocumentSnapshot<T>) => {
        const payload = docSnap.data() as T & Record<string, any>
        return attachDocId(payload, docSnap.id) as T
      },
    } as any)
    return data as Ref<T[] | undefined>
  }

  /** Fetch an entire collection (reactive) */
  const firestoreFetchCollection = <T>(
    collectionPath: string
  ): Ref<T[] | undefined> => {
    const q = fsq(collection(db, collectionPath)) as Query<T>
    return firestoreQuery<T>(q, collectionPath)
  }

  /** Fetch a single document (reactive) */
  const firestoreFetchDoc = <T>(
    collectionPath: string,
    docId: string
  ): Ref<T | undefined> => {
    const ref = doc(db, collectionPath, docId)
    const { data } = useDocument(ref, {
      ssrKey: `${collectionPath}-${docId}`,
      transform: (docSnap: DocumentSnapshot<T>) => {
        const payload = docSnap.data() as (T & Record<string, any>) | undefined
        return attachDocId(payload, docSnap.id) as T | undefined
      },
    } as any)
    return data as Ref<T | undefined>
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
      collection(db, collectionPath),
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
