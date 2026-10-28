import { refreshNuxtData } from 'nuxt/app'
import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import type { Ref } from 'vue'

type UseFirestoreDeleteOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

export function useFirestoreDelete(options: UseFirestoreDeleteOptions = {}) {
  const resolveDb = useFirestoreResolver(options.databaseId)

  async function deleteDocument(
    collectionPath: string,
    id: string
  ): Promise<void> {
    const path = collectionPath.trim()
    const documentId = id.trim()
    if (!path) throw new Error('Firestore collection path is required.')
    if (!documentId) throw new Error('Firestore document id is required.')
    const ref = doc(resolveDb(), path, documentId)
    await deleteDoc(ref)
    await refreshNuxtData()
  }

  return { deleteDocument }
}
