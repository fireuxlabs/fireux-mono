import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate.ts'
import { useRequireUser } from 'fireux-core/runtime/composables/firebase/useRequireUser.ts'

const COLLECTION = 'suppliers'

export function useSupplierUpdate() {
  const { updateDocument } = useFirestoreUpdate()

  const getUid = async () => {
    const u = await useRequireUser()
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
