import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import type { ProfileConfig } from 'fireux-core/runtime/models/core/profile.model.ts'
import { useUserUpdateForUid } from '../../user/mutations/useUserUpdate.ts'

type EnsureResult = {
  createdCore: boolean
  createdApp: boolean
}

/**
 * Minimal profile ensure.
 * - Upserts the core profile document `<collection>/<uid>`
 * - When tenant scoped, also upserts `apps/<appId>/<collection>/<uid>`
 */
export function useProfileEnsure(config: ProfileConfig) {
  const db = useFirestore()
  const { setDocument } = useFirestoreManager()
  const { isTenant, appId } = useFireUXConfig()

  const ensure = async (): Promise<EnsureResult> => {
    const { uid } = await requireUid()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, config.collectionName, uid)
    const coreSnapshot = await getDoc(coreRef)
    if (!coreSnapshot.exists()) {
      await setDocument(config.collectionName, uid, { id: uid })
      createdCore = true
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${config.collectionName}`
      const appRef = doc(db, 'apps', appId, config.collectionName, uid)
      const appSnapshot = await getDoc(appRef)
      if (!appSnapshot.exists()) {
        await setDocument(appCollection, uid, { id: uid })
        createdApp = true
      }
    }

    if (config.id) {
      try {
        const { addProfileTag } = useUserUpdateForUid(uid)
        await addProfileTag(config.id)
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useProfileEnsure] failed to tag user profile', {
            uid,
            profileId: config.id,
            error,
          })
        }
      }
    }

    return { createdCore, createdApp }
  }

  return { ensure }
}
