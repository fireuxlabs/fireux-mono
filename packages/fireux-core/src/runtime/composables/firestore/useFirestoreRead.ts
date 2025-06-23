import { useCollection, useDocument, useFirestore } from 'vuefire'
import { collection, doc, query, where } from 'firebase/firestore'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreUtils } from './useFirestoreUtils'
import type { Ref } from 'vue'

export function useFirestoreRead() {
  const db = useFirestore()
  const { appId } = useFireUXConfig() // Updated to use `appId`
  const { waitForCurrentUser } = useFirestoreUtils()

  async function firestoreFetchCollection<T>(
    name: string,
    opts?: { appScoped?: boolean }
  ): Promise<Ref<T[] | undefined>> {
    await waitForCurrentUser()
    let q
    if (opts?.appScoped !== false) {
      // Default: filter by appId
      q = query(collection(db, name), where('appId', '==', appId))
    } else {
      // No appId filter (global collection)
      q = query(collection(db, name))
    }
    const { data } = useCollection<T>(q, { ssrKey: name })
    return data as Ref<T[] | undefined> // Explicitly cast the type
  }

  async function firestoreFetchDoc<T>(
    name: string,
    id: string,
    opts?: { appScoped?: boolean }
  ): Promise<Ref<T | undefined>> {
    await waitForCurrentUser()
    // For global collections, just fetch the doc
    // For app-scoped, you may want to add extra validation, but Firestore doesn't filter by field on doc fetch
    const ref = doc(db, name, id)
    const { data } = useDocument<T>(ref, { ssrKey: `${name}-${id}` })
    return data as Ref<T | undefined>
  }

  return {
    firestoreFetchCollection,
    firestoreFetchDoc,
  }
}
