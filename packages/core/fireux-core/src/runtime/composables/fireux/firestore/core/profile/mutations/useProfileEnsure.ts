import { arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreManager } from '../../../operations/useFirestoreManager'
import { requireUid } from '../../../utils/useEnsureCommon'
import type { ProfileConfig } from '../../../../../../models/core/profile.model'

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
  const { setDocument, updateDocument } = useFirestoreManager()
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
        await updateDocument('users', uid, {
          profiles: arrayUnion(config.id) as unknown as string[],
        })
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
