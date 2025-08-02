import { useCollection, useDocument, useFirestore } from 'vuefire'
import { collection, doc, query } from 'firebase/firestore'
import type { Ref } from 'vue'

export function useFirestoreRead() {
  const db = useFirestore()

  async function firestoreFetchCollection<T>(
    collectionPath: string
  ): Promise<Ref<T[] | undefined>> {
    const q = query(collection(db, collectionPath))
    const { data } = useCollection<T>(q, { ssrKey: collectionPath })
    return data as Ref<T[] | undefined>
  }

  async function firestoreFetchDoc<T>(
    collectionPath: string,
    docId: string
  ): Promise<Ref<T | undefined>> {
    const ref = doc(db, collectionPath, docId)
    const { data } = useDocument<T>(ref, {
      ssrKey: `${collectionPath}-${docId}`,
    })
    return data as Ref<T | undefined>
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
  }
}
