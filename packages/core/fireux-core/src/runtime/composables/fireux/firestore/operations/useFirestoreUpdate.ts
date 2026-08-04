import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'
import type { Ref } from 'vue'

type UseFirestoreUpdateOptions = {
  databaseId?: string | Ref<string | null | undefined> | null | undefined
}

type UpdateOpts = Record<string, never>

export function useFirestoreUpdate(options: UseFirestoreUpdateOptions = {}) {
  const resolveDb = useFirestoreResolver(options.databaseId)
  const FORBIDDEN_TOP_LEVEL_KEYS = new Set(['id', 'uid', 'created', 'updated'])

  async function updateDocument<T>(
    collectionPath: string,
    id: string,
    data: Partial<T>,
    _opts: UpdateOpts = {}
  ): Promise<void> {
    const user = await useRequireUser()
    const ref = doc(resolveDb(), collectionPath, id)
    const patch = { ...(data as any) } as Record<string, unknown>
    const strippedKeys: string[] = []

    for (const key of Object.keys(patch)) {
      if (!FORBIDDEN_TOP_LEVEL_KEYS.has(key)) continue
      delete patch[key]
      strippedKeys.push(key)
    }

    if (import.meta.dev && strippedKeys.length) {
      console.warn('[firestore][updateDocument] stripped forbidden top-level keys', {
        collectionPath,
        id,
        keys: strippedKeys,
      })
    }

    await updateDoc(ref, {
      ...patch,
      updated: {
        at: serverTimestamp(),
        by: user.uid,
      } as any,
    })
  }

  return { updateDocument }
}
