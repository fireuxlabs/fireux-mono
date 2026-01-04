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
  const { setDocument } = useFirestoreManager()

  const requireAppConfig = () => {
    if (!appId) throw new Error('[useAppEnsure] missing config: appId')
    if (!ecosystem) throw new Error('[useAppEnsure] missing config: ecosystem')
    if (!role) throw new Error('[useAppEnsure] missing config: role')
    if (!appName) throw new Error('[useAppEnsure] missing config: appName')
    if (!appShortName)
      throw new Error('[useAppEnsure] missing config: appShortName')
    return { appId, ecosystem, role, appName, appShortName }
  }

  async function ensureAppDoc(): Promise<EnsureAppDocResult> {
    const cfg = requireAppConfig()

    const { uid } = await requireUid()
    const ref = doc(db, 'apps', cfg.appId)
    const snapshot = await getDoc(ref)

    if (!snapshot.exists()) {
      // IMPORTANT: keep this payload NON-membership.
      // Membership mirrors are written ONLY by ensureUserAppMembership().
      const payload = {
        id: cfg.appId,
        ecosystem: cfg.ecosystem,
        role: cfg.role,
        app_name: cfg.appName,
        app_short_name: cfg.appShortName,
        creator_id: uid,
        created_by: uid,
        status: 'active',
        description: '',
        social_links: { instagram: '' },
        avatar_url: '',
        logo_url: '',
        wordmark_url: '',
        join_requests: [],
        admin_ids: [],
        user_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } satisfies App

      await setDocument<App>('apps', cfg.appId, payload)
      await ensureAppMembership(uid, 'admin')
      return { created: true, id: cfg.appId }
    }

    await ensureAppMembership(uid, 'admin')
    return { created: false, id: cfg.appId }
  }

  async function ensureAppMembership(
    uid: string,
    membershipRole: 'admin' | 'user'
  ): Promise<EnsureMembershipResult> {
    const cfg = requireAppConfig()
    return ensureUserAppMembership(cfg.appId, uid, membershipRole)
  }

  const ensureApp = () => ensureAppDoc()

  return { ensureApp, ensureAppDoc, ensureAppMembership }
}
