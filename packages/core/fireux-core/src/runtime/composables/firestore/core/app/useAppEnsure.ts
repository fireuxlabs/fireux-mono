// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/app/useAppEnsure.ts
import { doc, getDoc, arrayUnion } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { useFirestoreManager } from '../../operations/useFirestoreManager.ts'
import type { App, AppRole } from 'fireux-core/runtime/models/core/app.model.ts'
import type { AppUserDoc } from 'fireux-core/runtime/models/core/user.model.ts'
import { requireUid, ensureAvatarUrl } from '../../utils/useEnsureCommon.ts'

type EnsureAppResult = {
  created: boolean
  id: string
}

export function useAppEnsure() {
  const db = useFirestore()
  const { setDocument, updateDocument } = useFirestoreManager()
  const { appId, ecosystem, role, appName } = useFireUXConfig()

  async function ensureApp(): Promise<EnsureAppResult> {
    if (ecosystem === '') throw new Error('[ensureApp] Missing ecosystem.')
    if (appId === '') throw new Error('[ensureApp] Missing appId.')

    // Auth required; we only need the uid
    const { uid } = await requireUid()

    const ref = doc(db, 'apps', appId)
    const snap = await getDoc(ref)

    // ---------- Existing app ----------
    if (snap.exists()) {
      const existing = snap.data() as Partial<App>
      const admins = Array.isArray(existing.admin_ids) ? existing.admin_ids : []
      const resolvedRole: AppRole =
        (existing.role as AppRole) || (role as AppRole)

      // Ensure caller is admin; always bump updated_at via updateDocument
      if (admins.includes(uid)) {
        await updateDocument<App>('apps', appId, {}) // stamps updated_at only
      } else {
        await updateDocument<App>('apps', appId, {
          admin_ids: arrayUnion(uid) as unknown as string[],
        })
      }

      await syncCoreAdminMembership(uid, resolvedRole)
      return { created: false, id: appId }
    }

    // ---------- New app ----------
    // Upload required brand assets from /public → Storage
    const [avatarUrl, logoUrl, wordmarkUrl] = await Promise.all([
      ensureAvatarUrl(`apps/${appId}/brand/avatar.png`, ['/img/brand/avatar.png'], true),
      ensureAvatarUrl(`apps/${appId}/brand/logo.png`, ['/img/brand/logo.png'], true),
      ensureAvatarUrl(`apps/${appId}/brand/wordmark.png`, ['/img/brand/wordmark.png'], true),
    ])

    // NOTE: We intentionally store only flat URLs; no nested brand object and no dimensions/types.
    const payload: App = {
      id: appId,
      ecosystem,
      role: role as AppRole,
      app_name: appName,
      admin_ids: [uid],           
      creator_id: uid,
      avatar_url: avatarUrl,      
      logo_url: logoUrl,
      wordmark_url: wordmarkUrl,
    }

    await setDocument('apps', appId, payload)
    await syncCoreAdminMembership(uid, role as AppRole)

    // Create app-user only for non-global apps
    if (role !== 'global') {
      const appUserPayload: AppUserDoc = { id: uid, role: 'admin' }
      await setDocument(`apps/${appId}/users`, uid, appUserPayload)
    }

    return { created: true, id: appId }
  }

  return { ensureApp }

  // ---------- Helpers ----------
  async function syncCoreAdminMembership(uid: string, r: AppRole) {
    try {
      const updates: Record<string, unknown> = {
        adminOf: arrayUnion(appId) as unknown as string[],
      }

      if (r === 'global') {
        // global hubs do not maintain userOf lists
      } else {
        updates.userOf = arrayUnion(appId) as unknown as string[]
      }

      await updateDocument('core-users', uid, updates as any)
    } catch (err) {
      if (import.meta.dev) console.warn('[ensureApp] core sync failed', err)
    }
  }
}
