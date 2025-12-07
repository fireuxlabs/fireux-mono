import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/config/FireUXConfig.ts'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import { useFirestoreManager } from '../../../operations/useFirestoreManager.ts'
import { ensureUserAppMembership } from '../../user/utils/ensureHelpers.ts'
import type { App } from 'fireux-core/runtime/models/core/app.model.ts'

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
    return ensureUserAppMembership(appId, uid, membershipRole, {
      appName,
    })
  }

  const ensureApp = () => ensureAppDoc()

  return { ensureApp, ensureAppDoc, ensureAppMembership }
}
