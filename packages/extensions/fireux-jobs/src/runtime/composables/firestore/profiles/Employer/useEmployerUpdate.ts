import { useFirestoreUpdate } from 'fireux-core/runtime/composables/firestore/useFirestoreUpdate.ts'
import { useFirestoreUtils } from 'fireux-core/runtime/composables/firestore/useFirestoreUtils.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useImageStorage } from 'fireux-core/runtime/composables/firebase/useImageStorage.ts'

// Note: All helpers are auto-imported at runtime by the Nuxt module, but we import explicitly for type safety.

const COLLECTION = 'employers'

type TargetScope = 'auto' | 'core' | 'app'

export function useEmployerUpdate() {
  const { updateDocument } = useFirestoreUpdate()
  const { waitForCurrentUser } = useFirestoreUtils()
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant' && !!appId
  const { uploadImage } = useImageStorage()

  async function getUid() {
    const u = await waitForCurrentUser()
    if (!u?.uid) throw new Error('User not authenticated')
    return u.uid
  }

  const targetFromScope = (uid: string, scope: TargetScope) => {
    if (scope === 'core') return { collection: COLLECTION, id: uid }
    if (scope === 'app') {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id: uid }
    }
    // auto → prefer app when tenant
    if (isTenant) {
      if (!appId) throw new Error('Missing appId for tenant-scoped update')
      return { collection: `apps/${appId}/${COLLECTION}`, id: uid }
    }
    return { collection: COLLECTION, id: uid }
  }

  const updateDisplayName = async (
    display_name: string,
    scope: TargetScope = 'auto'
  ) => {
    const uid = await getUid()
    const { collection, id } = targetFromScope(uid, scope)
    await updateDocument(collection, id, { display_name })
  }

  const updateAvatar = async (
    source: Blob | string,
    scope: TargetScope = 'auto'
  ) => {
    const uid = await getUid()
    const { collection, id } = targetFromScope(uid, scope)
    const path = `${collection}/${id}/avatar`
    const url = await uploadImage(path, source)
    await updateDocument(collection, id, { avatar: url })
    return url
  }

  return { updateDisplayName, updateAvatar }
}
