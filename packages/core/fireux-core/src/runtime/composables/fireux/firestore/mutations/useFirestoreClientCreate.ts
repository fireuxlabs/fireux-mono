import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import { useFireUXConfig } from '../../app/FireUXConfig'
import { useRequireUser } from '../../firebase/useRequireUser'
import {
  assertFirestoreMutationVerb,
  resolveFirestoreMutationDatabaseId,
} from '../../../../utils/firestore-mutations/targets'
import type { FirestoreMutationTarget } from '../../../../types/firestore-mutations'

export type ClientCreateOptions = Readonly<{
  id?: string
  stamp?: boolean
  creator?: boolean
  app?: boolean
}>

export function useFirestoreClientCreate() {
  return async function create<T>(
    target: FirestoreMutationTarget<string, 'client'>,
    data: T,
    options: ClientCreateOptions = {}
  ): Promise<string> {
    assertFirestoreMutationVerb(target, 'client', 'create')
    const db = useFirestoreResolver(
      resolveFirestoreMutationDatabaseId(target)
    )()
    const payload: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
    }
    delete payload.id
    if (options.stamp !== false) {
      const created: Record<string, unknown> = { at: serverTimestamp() }
      const updated: Record<string, unknown> = { at: serverTimestamp() }
      if (options.app) created.app_id = useFireUXConfig().appId
      if (options.creator) {
        const user = await useRequireUser()
        created.by = user.uid
        updated.by = user.uid
      }
      payload.created = created
      payload.updated = updated
    }
    const id = options.id?.trim()
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
