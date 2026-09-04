import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'
import type { Ref } from 'vue'

type UseFirestoreUpdateOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

export type FirestoreUpdateOptions = Readonly<{
  stamp?: boolean
  updater?: boolean
}>

export function useFirestoreUpdate(options: UseFirestoreUpdateOptions = {}) {
  const resolveDb = useFirestoreResolver(options.databaseId)
  const FORBIDDEN_TOP_LEVEL_KEYS = new Set(['id', 'uid', 'created', 'updated'])

  async function updateDocument<T>(
    collectionPath: string,
    id: string,
    data: Partial<T>,
    updateOptions: FirestoreUpdateOptions = {}
  ): Promise<void> {
    const path = collectionPath.trim()
    const documentId = id.trim()
    if (!path) throw new Error('Firestore collection path is required.')
    if (!documentId) throw new Error('Firestore document id is required.')

    const ref = doc(resolveDb(), path, documentId)
    const patch = { ...(data as any) } as Record<string, unknown>
    const strippedKeys: string[] = []

    for (const key of Object.keys(patch)) {
      if (!FORBIDDEN_TOP_LEVEL_KEYS.has(key)) continue
      delete patch[key]
      strippedKeys.push(key)
    }

    if (import.meta.dev && strippedKeys.length) {
      console.warn(
        '[firestore][updateDocument] stripped forbidden top-level keys',
        {
          collectionPath,
          id,
          keys: strippedKeys,
        }
      )
    }

    if (updateOptions.stamp !== false) {
      const updated: Record<string, unknown> = { at: serverTimestamp() }
      if (updateOptions.updater !== false) {
        updated.by = (await useRequireUser()).uid
      }
      patch.updated = updated
    }

    await updateDoc(ref, patch)
  }

  return { updateDocument }
}
