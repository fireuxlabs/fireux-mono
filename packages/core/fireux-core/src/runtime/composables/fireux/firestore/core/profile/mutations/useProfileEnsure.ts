import { arrayUnion, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  createAppProfileSeed,
  createProfileSeed,
  type ProfileBase,
  type ProfileConfig,
} from '../../../../../../models/core/profile.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreManager } from '../../../operations/useFirestoreManager'
import { requireUid } from '../../../utils/useEnsureCommon'

type EnsureResult = {
  createdCore: boolean
  createdApp: boolean
  id: string
  coreProfile: ProfileBase | null
}

/**
 * Minimal profile ensure.
 * - Upserts the core profile document `<collection>/<uid>`
 * - When an app id exists, also upserts `apps/<appId>/<collection>/<uid>`
 */
export function useProfileEnsure(config: ProfileConfig) {
  const db = useFirestore()
  const { setDocument, updateDocument } = useFirestoreManager()
  const { appId } = useFireUXConfig()

  const ensure = async (overrideUid?: string | null): Promise<EnsureResult> => {
    const { uid: authedUid } = await requireUid()
    const uid = (overrideUid ?? authedUid).trim()

    let createdCore = false
    let createdApp = false

    const coreRef = doc(db, config.collectionName, uid)
    const coreSnapshot = await getDoc(coreRef)
    if (!coreSnapshot.exists()) {
      const seed = createProfileSeed()
      await setDocument(config.collectionName, uid, {
        title: seed.title,
        subtitle: seed.subtitle,
        tagline: seed.tagline,
        tags: [...seed.tags],
      } as any, {
        creator: true,
      })
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

    if (appId) {
      const appCollection = `apps/${appId}/${config.collectionName}`
      const appRef = doc(db, 'apps', appId, config.collectionName, uid)
      const appSnapshot = await getDoc(appRef)
      if (!appSnapshot.exists()) {
        const seed = createAppProfileSeed()
        await setDocument(appCollection, uid, {
          created: seed.created,
          updated: seed.updated,
        } as any, {
          creator: true,
          app: true,
        })
        createdApp = true
      } else {
        const existing = appSnapshot.data() as any
        const patch: any = {}
        if (!(existing?.created && existing?.created.at)) {
          patch['created.at'] = existing?.created_at ?? serverTimestamp()
        }
        if (!String(existing?.created?.app_id || '').trim()) {
          patch['created.app_id'] = appId
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

    const refreshedCoreSnapshot = await getDoc(coreRef)
    const refreshedCoreProfile = refreshedCoreSnapshot.exists()
      ? ({
          ...(refreshedCoreSnapshot.data() as any),
          id: refreshedCoreSnapshot.id,
        } as ProfileBase)
      : null

    return { createdCore, createdApp, id: uid, coreProfile: refreshedCoreProfile }
  }

  return { ensure }
}
