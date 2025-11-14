// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/main/useAppEnsure.ts
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { arrayUnion, doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import { ensureCoreUserDocument } from '../../user/main/useUserEnsure.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'
import type {
  AppUser,
  User,
} from 'fireux-core/runtime/models/core/user.model.ts'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const { appId, ecosystem, role, appName } = useFireUXConfig()
  const db = useFirestore()
  const { setDocument, updateDocument } = useFirestoreManager()

  async function ensureAppDoc(): Promise<EnsureAppDocResult> {
    if (!appId || !ecosystem) {
      throw new Error('[ensureAppDoc] missing app configuration')
    }

    const { uid } = await requireUid()
    const payload = {
      id: appId,
      ecosystem,
      role,
      app_name: appName || appId,
      creator_id: uid,
      admin_ids: [uid],
    } as App

    const ref = doc(db, 'apps', appId)
    const snapshot = await getDoc(ref)

    if (snapshot.exists()) {
      const current = snapshot.data() as App | undefined
      const adminIds = Array.isArray(current?.admin_ids)
        ? current.admin_ids
        : []
      if (!adminIds.includes(uid)) {
        const nextAdminIds = [...adminIds, uid]
        await updateDocument<App>('apps', appId, { admin_ids: nextAdminIds })
      }
      return { created: false, id: appId }
    }

    await setDocument<App>('apps', appId, payload)
    await ensureAppMembership(uid, 'admin')
    return { created: true, id: appId }
  }

  async function ensureAppMembership(
    uid: string,
    membershipRole: 'admin' | 'user' = 'user'
  ): Promise<EnsureMembershipResult> {
    if (!appId) return { created: false }

    const ref = doc(db, 'apps', appId, 'users', uid)
    const snapshot = await getDoc(ref)

    let created = true
    if (snapshot.exists()) {
      created = false
      const current = snapshot.data() as AppUser | undefined
      if (current && current.role !== membershipRole) {
        await updateDocument<AppUser>(`apps/${appId}/users`, uid, {
          role: membershipRole,
        })
      }
    } else {
      const payload: AppUser = {
        id: uid,
        role: membershipRole,
        creator_id: uid,
      } as AppUser
      await setDocument<AppUser>(`apps/${appId}/users`, uid, payload)
    }

    await ensureCoreUserDocument(uid)

    const membershipUpdates: Partial<User> =
      membershipRole === 'admin'
        ? {
            adminOf: arrayUnion(appId) as unknown as string[],
            userOf: arrayUnion(appId) as unknown as string[],
          }
        : {
            userOf: arrayUnion(appId) as unknown as string[],
          }

    await updateDocument<User>('users', uid, membershipUpdates)

    return { created }
  }

  const ensureApp = () => ensureAppDoc()

  return { ensureApp, ensureAppDoc, ensureAppMembership }
}
