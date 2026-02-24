import { updateDoc, doc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useRequireUser } from '../../firebase/useRequireUser'

type UpdateOpts = {
  /** When false, skip transitional flat `updated_at` writes. */
  legacyFlat?: boolean
}

export function useFirestoreUpdate() {
  const db = useFirestore()

  async function updateDocument<T>(
    collectionPath: string,
    id: string,
    data: Partial<T>,
    opts: UpdateOpts = {}
  ): Promise<void> {
    const user = await useRequireUser()
    const ref = doc(db, collectionPath, id)
    const includeLegacyFlat = opts.legacyFlat !== false
    await updateDoc(ref, {
      ...data,
      updated: {
        at: serverTimestamp(),
        by: user.uid,
      } as any,
      ...(includeLegacyFlat
        ? {
            // Legacy flat field kept temporarily while readers/data migrate.
            updated_at: serverTimestamp(),
          }
        : {}),
    })
  }

  return { updateDocument }
}
