import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'
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
    await useRequireUser()
    const ref = doc(resolveDb(), collectionPath, id)
    await deleteDoc(ref)
  }

  return { deleteDocument }
}
