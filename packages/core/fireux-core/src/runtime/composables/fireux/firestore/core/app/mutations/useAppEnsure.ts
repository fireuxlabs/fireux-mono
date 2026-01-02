import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { requireUid } from '../../../utils/useEnsureCommon'
import { useFirestoreManager } from '../../../operations/useFirestoreManager'
import { ensureUserAppMembership } from '../../user/utils/ensureHelpers'
import type { App } from '../../../../../../models/core/app.model'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const { appId, ecosystem, role, appName, appShortName } = useFireUXConfig()
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
      app_name: appName,
      app_short_name: appShortName,
      creator_id: uid,
      created_by: uid,
      admin_ids: [uid],
      join_requests: [],
      status: 'active',
      description: '',
      social_links: { instagram: '' },
      avatar_url: '',
      logo_url: '',
      wordmark_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as App

    const ref = doc(db, 'apps', appId)
    const snapshot = await getDoc(ref)

    if (snapshot.exists()) {
      const current = snapshot.data() as App | undefined
      const adminIds = Array.isArray(current?.admin_ids)
        ? current.admin_ids
        : []
      console.info('[ensureAppDoc] existing app found', {
        appId,
        adminCount: adminIds.length,
        adminIds,
      })
      if (!adminIds.includes(uid)) {
        const nextAdminIds = [...adminIds, uid]
        await updateDocument<App>('apps', appId, { admin_ids: nextAdminIds })
        console.info('[ensureAppDoc] added caller as admin', {
          appId,
          adminCount: nextAdminIds.length,
          adminIds: nextAdminIds,
        })
      }
      await ensureAppMembership(uid, 'admin')
      return { created: false, id: appId }
    }

    await setDocument<App>('apps', appId, payload)
    console.info('[ensureAppDoc] created app', {
      appId,
      adminCount: payload.admin_ids?.length ?? 0,
      adminIds: payload.admin_ids,
    })
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
