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
} from 'firebase/firestore'
import type { Ref } from 'vue'

/**
 * Unified Firestore read composable for FireUX.
 * Covers single docs, full collections, and common query patterns.
 */
export function useFirestoreRead() {
  const db = useFirestore()

  /** ───────────────────────────────
   * Fetch an entire collection (live reactive)
   * ─────────────────────────────── */
  function firestoreFetchCollection<T>(
    collectionPath: string
  ): Ref<T[] | undefined> {
    const q = fsq(collection(db, collectionPath))
    return firestoreQuery<T>(q, collectionPath)
  }

  /** ───────────────────────────────
   * Fetch a single document (live reactive)
   * ─────────────────────────────── */
  function firestoreFetchDoc<T>(
    collectionPath: string,
    docId: string
  ): Ref<T | undefined> {
    const ref = doc(db, collectionPath, docId)
    const { data } = useDocument<T>(ref, {
      ssrKey: `${collectionPath}-${docId}`,
    })
    return data as Ref<T | undefined>
  }

  /** ───────────────────────────────
   * Run any Firestore Query (live reactive)
   * Pass your own Query (with where, orderBy, etc.)
   * ─────────────────────────────── */
  function firestoreQuery<T>(
    q: Query<T>,
    ssrKey?: string
  ): Ref<T[] | undefined> {
    const { data } = useCollection<T>(q, ssrKey ? { ssrKey } : undefined)
    return data as Ref<T[] | undefined>
  }

  /** ───────────────────────────────
   * Convenience prefix search for “starts with” text fields
   * Requires field to be indexed and lowercased
   * ─────────────────────────────── */
  async function firestorePrefixSearch<T>(
    collectionPath: string,
    field: keyof T & string,
    value: string,
    max = 10
  ): Promise<T[]> {
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
