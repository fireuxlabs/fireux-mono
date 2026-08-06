import { addDoc, collection, doc, runTransaction } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import {
  assertFirestoreMutationVerb,
  resolveFirestoreMutationDatabaseId,
} from '../../../../utils/firestore-mutations/targets'
import type { FirestoreMutationTarget } from '../../../../types/firestore-mutations'

export function useClientCreate() {
  return async function create<T>(
    target: FirestoreMutationTarget<string, 'client'>,
    data: T,
    id?: string
  ): Promise<string> {
    assertFirestoreMutationVerb(target, 'client', 'create')
    const db = useFirestoreResolver(
      resolveFirestoreMutationDatabaseId(target)
    )()
    const payload = { ...(data as Record<string, unknown>) }
    delete payload.id
    if (!id)
      return (await addDoc(collection(db, target.collectionPath), payload)).id
    await runTransaction(db, async (transaction) => {
      const reference = doc(db, target.collectionPath, id)
      if ((await transaction.get(reference)).exists()) {
        throw new Error(
          `Firestore create target already exists: ${target.key}/${id}`
        )
      }
      transaction.set(reference, payload)
    })
    return id
  }
}
