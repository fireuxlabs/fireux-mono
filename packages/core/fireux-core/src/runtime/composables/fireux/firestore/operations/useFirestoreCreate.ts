import {
  addDoc,
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore'
import type { Ref } from 'vue'
import { useFireUXConfig } from '../../../../app/composables/config/FireUXConfig'
import { useRequireUser } from '../../firebase/useRequireUser'
import { useFirestoreResolver } from '../vuefire'

type UseFirestoreCreateOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

export type FirestoreCreateOptions = Readonly<{
  id?: string
  stamp?: boolean
  creator?: boolean
  app?: boolean
}>

export function useFirestoreCreate(options: UseFirestoreCreateOptions = {}) {
  const resolveDb = useFirestoreResolver(options.databaseId)

  async function createDocument<T>(
    collectionPath: string,
    data: T,
    createOptions: FirestoreCreateOptions = {}
  ): Promise<string> {
    const path = collectionPath.trim()
    if (!path) throw new Error('Firestore collection path is required.')

    const payload: Record<string, unknown> = {
      ...(data as Record<string, unknown>),
    }
    delete payload.id

    if (createOptions.stamp !== false) {
      const created: Record<string, unknown> = { at: serverTimestamp() }
      const updated: Record<string, unknown> = { at: serverTimestamp() }
      if (createOptions.app) created.app_id = useFireUXConfig().appId
      if (createOptions.creator) {
        const user = await useRequireUser()
        created.by = user.uid
        updated.by = user.uid
      }
      payload.created = created
      payload.updated = updated
    }

    const db = resolveDb()
    const id = createOptions.id?.trim()
    if (!id) return (await addDoc(collection(db, path), payload)).id

    await runTransaction(db, async (transaction) => {
      const reference = doc(db, path, id)
      if ((await transaction.get(reference)).exists()) {
        throw new Error(`Firestore document already exists: ${path}/${id}`)
      }
      transaction.set(reference, payload)
    })
    return id
  }

  return { createDocument }
}
