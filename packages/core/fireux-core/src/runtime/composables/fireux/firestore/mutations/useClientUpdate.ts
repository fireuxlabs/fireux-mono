import { doc, updateDoc } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import {
  assertFirestoreMutationVerb,
  resolveFirestoreMutationDatabaseId,
} from '../../../../utils/firestore-mutations/targets'
import type { FirestoreMutationTarget } from '../../../../types/firestore-mutations'

export function useClientUpdate() {
  return async function update<T>(
    target: FirestoreMutationTarget<string, 'client'>,
    id: string,
    data: Partial<T>
  ): Promise<void> {
    assertFirestoreMutationVerb(target, 'client', 'update')
    const db = useFirestoreResolver(
      resolveFirestoreMutationDatabaseId(target)
    )()
    await updateDoc(
      doc(db, target.collectionPath, id),
      data as Record<string, unknown>
    )
  }
}
