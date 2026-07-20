// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: bind browser-created profiles to the authenticated User id.
// Concurrent edit — 2026-07-20 13:19 CEST — Profile overlay follow-up: keep overlays delta-only and mirror every app-backed profile to UserApp.
// Concurrent edit — 2026-07-20 13:29 CEST — Root profile identity cutover: create and repair domain-only root profile documents.
import { arrayUnion, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import {
  readRuntimeIdentityFirestoreDatabaseId,
  useFirestore,
} from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import {
  createAppProfileSeed,
  createProfileSeed,
  type ProfileConfig,
} from '../../../../../../models/core/profile.model'
import { AppStorage } from '../../../../../../models/core/app.model'
import { UserStorage } from '../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { useFirestoreCreate } from '../../../operations/useFirestoreCreate'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate'
import { requireUid } from '../../../utils/useEnsureCommon'
import { mutateAppMembership } from '../../user/utils/appMembershipMutation'

type ProfileCreateResult = {
  createdCore: boolean
  createdApp: boolean
}

/**
 * Minimal profile create.
 * - Creates the core profile document `<collection>/<uid>` when missing.
 * - When an app id exists, creates a delta-only app overlay without `user`.
 * - Records app-backed profiles on UserApp; root-backed profiles also tag User.
 */
export function useProfileCreate(config: ProfileConfig) {
  const identityDatabaseId = readRuntimeIdentityFirestoreDatabaseId()
  const appDb = useFirestore()
  const identityDb = useFirestore(identityDatabaseId)
  const appCreate = useFirestoreCreate()
  const appUpdate = useFirestoreUpdate()
  const identityCreate = useFirestoreCreate({ databaseId: identityDatabaseId })
  const identityUpdate = useFirestoreUpdate({ databaseId: identityDatabaseId })
  const { appId } = useFireUXConfig()

  const createProfile = async (
    overrideUid?: string | null
  ): Promise<ProfileCreateResult> => {
    const { uid: authedUid } = await requireUid()
    const uid = (overrideUid ?? authedUid).trim()
    if (!uid || uid !== authedUid) {
      throw new Error(
        '[useProfileCreate] Client profile creation must target the signed-in user.'
      )
    }

    let createdCore = false
    let createdApp = false
    const appOnly = config.storage === 'app-only'
    if (appOnly && !appId) {
      throw new Error(`[useProfileCreate] App context required for ${config.id}.`)
    }
    if (!appOnly) {
      const coreRef = doc(identityDb, config.collectionName, uid)
      const coreSnapshot = await getDoc(coreRef)
      if (!coreSnapshot.exists()) {
        const seed = createProfileSeed()
        const rootCreateData = { ...(config.rootCreateData ?? {}) }
        delete rootCreateData.user
        await identityCreate.setDocument(config.collectionName, uid, {
          title: seed.title,
          subtitle: seed.subtitle,
          tagline: seed.tagline,
          tags: [...seed.tags],
          ...rootCreateData,
        } as any, {
          creator: true,
        })
        createdCore = true
      } else {
        const existing = coreSnapshot.data() as any
        const patch: any = {}
        if (typeof existing?.title !== 'string') patch.title = ''
        if (typeof existing?.subtitle !== 'string') patch.subtitle = ''
        if (typeof existing?.tagline !== 'string') patch.tagline = ''
        if (!Array.isArray(existing?.tags)) patch.tags = []
        for (const [key, value] of Object.entries(config.rootCreateData ?? {})) {
          if (key !== 'user' && !(key in existing)) patch[key] = value
        }
        if (!(existing?.created && existing?.created.at)) {
          patch['created.at'] = existing?.created_at ?? serverTimestamp()
        }
        if (Object.keys(patch).length) {
          await identityUpdate.updateDocument(config.collectionName, uid, patch)
        }
      }
    }

    if (appId) {
      const appCollection = `${AppStorage.collection}/${appId}/${config.collectionName}`
      const appRef = doc(appDb, AppStorage.collection, appId, config.collectionName, uid)
      const appSnapshot = await getDoc(appRef)
      if (!appSnapshot.exists()) {
        const seed = createAppProfileSeed()
        const appCreateData = { ...(config.appCreateData ?? {}) }
        delete appCreateData.user
        await appCreate.setDocument(appCollection, uid, {
          created: seed.created,
          updated: seed.updated,
          ...appCreateData,
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
          await appUpdate.updateDocument(appCollection, uid, patch)
        }
      }
    }

    if (config.id && appId) {
      await mutateAppMembership({
        action: 'set-profile',
        profileId: config.id,
        enabled: true,
      })
    }

    if (config.id && !appOnly) {
      try {
        await identityUpdate.updateDocument(UserStorage.rootCollection, uid, {
          profiles: arrayUnion(config.id) as unknown as string[],
        })
      } catch (error) {
        if (import.meta.dev) {
          console.warn('[useProfileCreate] failed to tag user profile', {
            uid,
            profileId: config.id,
            error,
          })
        }
      }
    }

    return { createdCore, createdApp }
  }

  return { createProfile }
}
