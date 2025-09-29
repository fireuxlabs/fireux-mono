import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils'

const COLLECTION = 'suppliers'

export function useSupplierUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()

  async function getUid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const updateDisplayName = async (display_name: string) => {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { display_name })
  }

  const updateAvatar = async (avatar: string) => {
    const uid = await getUid()
    await updateDocument(COLLECTION, uid, { avatar })
  }

  return { updateDisplayName, updateAvatar }
}
