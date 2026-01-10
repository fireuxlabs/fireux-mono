import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { deleteField, doc, getDoc, serverTimestamp } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { requireUid } from '../../../utils/useEnsureCommon'
import { useFirestoreManager } from '../../../operations/useFirestoreManager'
import { ensureUserAppMembership } from '../../user/utils/ensureHelpers'
import type { App } from '../../../../../../models/core/app.model'
import { createEmptyAppSocialLinks } from '../../../../../../models/core/app.supporting'

type EnsureAppDocResult = { created: boolean; id: string }
type EnsureMembershipResult = { created: boolean }

export function useAppEnsure() {
  const { appId, ecosystem, role, appName, appShortName } = useFireUXConfig()
  const db = useFirestore()
  const { setDocument, updateDocument } = useFirestoreManager()

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
        tagline: '',
        description: '',
        short_bio: '',
        long_bio: '',
        social_links: createEmptyAppSocialLinks(),
        join_requests: [],
        admin_ids: [],
        user_count: 0,
        // Canon: server timestamps for all Firestore docs.
        created_at: serverTimestamp() as any,
        updated_at: serverTimestamp() as any,

        // Media URLs (no optionals; empty string = not set)
        thumbnail_url: '',
        logo_url: '',
        wordmark_light_url: '',
        wordmark_dark_url: '',
      } satisfies App

      await setDocument<App>('apps', cfg.appId, payload)
      await ensureAppMembership(uid, 'admin')
      return { created: true, id: cfg.appId }
    }

    // Existing doc may predate current schema. Backfill required keys with safe defaults.
    const existing = snapshot.data() as Partial<App> | undefined
    const patch: Partial<App> = {}

    if (!existing?.id) patch.id = cfg.appId
    if (!existing?.ecosystem) patch.ecosystem = cfg.ecosystem
    if (!existing?.role) patch.role = cfg.role
    if (!existing?.app_name) patch.app_name = cfg.appName
    if (!existing?.app_short_name) patch.app_short_name = cfg.appShortName
    if (!existing?.creator_id) patch.creator_id = uid
    if (!existing?.created_by) patch.created_by = uid
    if (typeof existing?.tagline !== 'string') patch.tagline = ''
    if (typeof existing?.description !== 'string') patch.description = ''
    if (typeof existing?.short_bio !== 'string') patch.short_bio = ''
    if (typeof existing?.long_bio !== 'string') patch.long_bio = ''

    const socialLinks = (existing as any)?.social_links
    const emptySocial = createEmptyAppSocialLinks()
    if (!socialLinks || typeof socialLinks !== 'object') {
      patch.social_links = emptySocial
    } else {
      const next = { ...emptySocial }
      for (const key of Object.keys(emptySocial) as Array<keyof typeof emptySocial>) {
        const raw = (socialLinks as any)[key]
        next[key] = typeof raw === 'string' ? raw : ''
      }
      patch.social_links = next
    }

    // Image URL fields are required strings (empty string means "not set").
    if (typeof (existing as any)?.thumbnail_url !== 'string') patch.thumbnail_url = ''
    if (typeof (existing as any)?.logo_url !== 'string') patch.logo_url = ''
    if (typeof (existing as any)?.wordmark_light_url !== 'string') patch.wordmark_light_url = ''
    if (typeof (existing as any)?.wordmark_dark_url !== 'string') patch.wordmark_dark_url = ''

    // Also, ensure no legacy field can linger (canon is light/dark wordmarks only).
    if (typeof (existing as any)?.wordmark_url === 'string') {
      ;(patch as any).wordmark_url = deleteField()
    }

    if (!Array.isArray(existing?.join_requests)) patch.join_requests = []
    if (!Array.isArray(existing?.admin_ids)) patch.admin_ids = []
    if (typeof existing?.user_count !== 'number') patch.user_count = 0
    if (!existing?.created_at) patch.created_at = serverTimestamp() as any

    if (Object.keys(patch).length) {
      await updateDocument<App>('apps', cfg.appId, patch)
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
