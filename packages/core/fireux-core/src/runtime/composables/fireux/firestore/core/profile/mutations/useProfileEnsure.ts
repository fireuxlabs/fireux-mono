import { arrayUnion, doc, getDoc, serverTimestamp } from 'firebase/firestore'
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
      await setDocument(config.collectionName, uid, {
        id: uid,
        title: '',
        subtitle: '',
        tagline: '',
        tags: [],
        creator_id: uid,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      } as any)
      createdCore = true
    } else {
      // Backfill required fields for older docs.
      const existing = coreSnapshot.data() as any
      const patch: any = {}
      if (typeof existing?.id !== 'string') patch.id = uid
      if (typeof existing?.title !== 'string') patch.title = ''
      if (typeof existing?.subtitle !== 'string') patch.subtitle = ''
      if (typeof existing?.tagline !== 'string') patch.tagline = ''
      if (!Array.isArray(existing?.tags)) patch.tags = []
      if (typeof existing?.creator_id !== 'string') patch.creator_id = uid
      if (!existing?.created_at) patch.created_at = serverTimestamp()
      if (!existing?.updated_at) patch.updated_at = serverTimestamp()
      if (Object.keys(patch).length) {
        await updateDocument(config.collectionName, uid, patch)
      }
    }

    if (isTenant && appId) {
      const appCollection = `apps/${appId}/${config.collectionName}`
      const appRef = doc(db, 'apps', appId, config.collectionName, uid)
      const appSnapshot = await getDoc(appRef)
      if (!appSnapshot.exists()) {
        await setDocument(appCollection, uid, {
          id: uid,
          creator_id: uid,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        } as any)
        createdApp = true
      } else {
        const existing = appSnapshot.data() as any
        const patch: any = {}
        if (typeof existing?.id !== 'string') patch.id = uid
        if (typeof existing?.creator_id !== 'string') patch.creator_id = uid
        if (!existing?.created_at) patch.created_at = serverTimestamp()
        if (!existing?.updated_at) patch.updated_at = serverTimestamp()
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
