import { deleteDoc, doc } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import {
  assertFirestoreMutationVerb,
  resolveFirestoreMutationDatabaseId,
} from '../../../../utils/firestore-mutations/targets'
import type { FirestoreMutationTarget } from '../../../../types/firestore-mutations'

export function useClientDelete() {
  return async function remove(
    target: FirestoreMutationTarget<string, 'client'>,
    id: string
  ): Promise<void> {
    assertFirestoreMutationVerb(target, 'client', 'delete')
    const db = useFirestoreResolver(
      resolveFirestoreMutationDatabaseId(target)
    )()
    await deleteDoc(doc(db, target.collectionPath, id))
  }
}
