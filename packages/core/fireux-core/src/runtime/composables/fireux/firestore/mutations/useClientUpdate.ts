import { doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { useFirestoreResolver } from '../vuefire'
import {
  assertFirestoreMutationVerb,
  resolveFirestoreMutationDatabaseId,
} from '../../../../utils/firestore-mutations/targets'
import { useRequireUser } from '../../firebase/useRequireUser'
import type { FirestoreMutationTarget } from '../../../../types/firestore-mutations'

const FORBIDDEN_TOP_LEVEL_KEYS = new Set(['id', 'uid', 'created', 'updated'])

export type UseClientUpdateOptions = {
  stamp?: boolean
}

export function useClientUpdate() {
  return async function updateDocument<T>(
    target: FirestoreMutationTarget<string, 'client'>,
    id: string,
    data: Partial<T>,
    options: UseClientUpdateOptions = {}
  ): Promise<void> {
    const patch = { ...(data as Record<string, unknown>) }
    const strippedKeys: string[] = []

    assertFirestoreMutationVerb(target, 'client', 'update')

    for (const key of Object.keys(patch)) {
      if (!FORBIDDEN_TOP_LEVEL_KEYS.has(key)) continue
      delete patch[key]
      strippedKeys.push(key)
    }
    if (import.meta.dev && strippedKeys.length) {
      console.warn('[firestore][updateDocument] stripped forbidden top-level keys', {
        target: target.key,
        id,
        keys: strippedKeys,
      })
    }

    if (options.stamp !== false) {
      const user = await useRequireUser()
      patch.updated = {
        at: serverTimestamp(),
        by: user.uid,
      } as Record<string, unknown>
    }

    const db = useFirestoreResolver(
      resolveFirestoreMutationDatabaseId(target)
    )()
    await updateDoc(
      doc(db, target.collectionPath, id),
      patch
    )
  }
}
