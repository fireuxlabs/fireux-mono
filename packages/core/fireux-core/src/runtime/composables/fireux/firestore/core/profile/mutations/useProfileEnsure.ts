import { arrayUnion, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import type { ProfileConfig } from '../../../../../../models/core/profile.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreManager } from '../../../operations/useFirestoreManager'
import { requireUid } from '../../../utils/useEnsureCommon'

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

  const ensure = async (overrideUid?: string | null): Promise<EnsureResult> => {
    const { uid: authedUid } = await requireUid()
    const uid = (overrideUid ?? authedUid).trim()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, config.collectionName, uid)
    const coreSnapshot = await getDoc(coreRef)
    if (!coreSnapshot.exists()) {
      await setDocument(config.collectionName, uid, {
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
      } as any)
      createdCore = true
    } else {
      // Backfill required fields for older docs.
      const existing = coreSnapshot.data() as any
      const patch: any = {}
      if (typeof existing?.title !== 'string') patch.title = ''
      if (typeof existing?.subtitle !== 'string') patch.subtitle = ''
      if (typeof existing?.tagline !== 'string') patch.tagline = ''
      if (!Array.isArray(existing?.tags)) patch.tags = []
      if (!(existing?.created && existing?.created.at)) {
        patch['created.at'] = existing?.created_at ?? serverTimestamp()
      }
      if (Object.keys(patch).length) {
        await updateDocument(config.collectionName, uid, patch)
      }
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${config.collectionName}`
      const appRef = doc(db, 'apps', appId, config.collectionName, uid)
      const appSnapshot = await getDoc(appRef)
      if (!appSnapshot.exists()) {
        await setDocument(appCollection, uid, {} as any)
        createdApp = true
      } else {
        const existing = appSnapshot.data() as any
        const patch: any = {}
        if (!(existing?.created && existing?.created.at)) {
          patch['created.at'] = existing?.created_at ?? serverTimestamp()
        }
        if (Object.keys(patch).length) {
          await updateDocument(appCollection, uid, patch)
        }
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
