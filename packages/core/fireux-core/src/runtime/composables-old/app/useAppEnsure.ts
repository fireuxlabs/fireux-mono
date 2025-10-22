// packages/core/fireux-core/src/runtime/composables/app/useAppEnsure.ts
import {
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  serverTimestamp,
} from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../FireUXConfig'
import { useFirestoreCreate } from '../firestore/useFirestoreCreate'
import type { App, AppRole } from '../../models/core/app.model'
import type { AppUserDoc } from '../../models/core/user.model'
import {
  requireUid,
  ensureAvatarUrl,
} from '../firestore/ensure/useEnsureCommon'

type EnsureAppResult = {
  created: boolean
  id: string
  avatarUrl?: string | null
}

export function useAppEnsure() {
  const db = useFirestore()
  const cfg = useFireUXConfig()
  const { setDocument } = useFirestoreCreate()

  const buildAvatarCandidates = (authPhotoUrl?: string | null) => {
    const candidates: Array<string | null | undefined> = []
    const configuredIcon =
      typeof cfg.appIcon === 'string' ? cfg.appIcon.trim() : ''

    if (configuredIcon.length > 0) {
      const lower = configuredIcon.toLowerCase()
      if (
        lower.startsWith('http://') ||
        lower.startsWith('https://') ||
        configuredIcon.startsWith('/') ||
        configuredIcon.includes('/public/')
      ) {
        candidates.push(configuredIcon)
      }
    }

    const staticWordmarkPath = `projects/${cfg.ecosystem}/${cfg.appId}/public/img/wordmark-light.svg`
    if (!candidates.includes(staticWordmarkPath)) {
      candidates.push(staticWordmarkPath)
    }

    const trimmedPhoto =
      typeof authPhotoUrl === 'string' ? authPhotoUrl.trim() : ''
    if (trimmedPhoto.length > 0) {
      candidates.push(trimmedPhoto)
    }

    return candidates
  }

  async function ensureApp(): Promise<EnsureAppResult> {
    if (!cfg.ecosystem) {
      throw new Error('[ensureApp] Missing ecosystem in config.')
    }

    if (!cfg.appId) {
      throw new Error('[ensureApp] Missing appId in config.')
    }

    const { uid, auth } = await requireUid()

    const ref = doc(db, 'apps', cfg.appId)
    const snap = await getDoc(ref)

    if (snap.exists()) {
      const existing = snap.data() as Partial<App>
      const admins = Array.isArray(existing.admin_ids) ? existing.admin_ids : []
      const resolvedRole: AppRole =
        (existing.role as AppRole) || (cfg.role as AppRole) || 'tenant'

      if (admins.includes(uid)) {
        await syncCoreAdminMembership(uid, resolvedRole)
      } else {
        await updateDoc(ref, { admin_ids: arrayUnion(uid) })
        await syncCoreAdminMembership(uid, resolvedRole)
      }

      return {
        created: false,
        id: cfg.appId,
        avatarUrl: existing.avatar_url ?? null,
      }
    }

    const role: AppRole = (cfg.role as AppRole) || 'tenant'
    const payload: App = {
      id: cfg.appId,
      ecosystem: cfg.ecosystem,
      role,
      app_name: cfg.appName || 'New App',
      ...(cfg.appShortName ? { app_short_name: cfg.appShortName } : {}),
      admin_ids: [uid],
      creator_id: uid,
      avatar_url: null,
    }

    const avatarUrl = await ensureAvatarUrl(
      `apps/${cfg.appId}/avatar.png`,
      buildAvatarCandidates(auth?.photoURL),
      true
    )

    await setDocument('apps', cfg.appId, {
      ...payload,
      avatar_url: avatarUrl,
    })

    await syncCoreAdminMembership(uid, role)

    if (role !== 'global') {
      const appUserPayload: Partial<AppUserDoc> = {
        id: uid,
        role: 'admin',
      }

      await setDocument(
        `apps/${cfg.appId}/users`,
        uid,
        appUserPayload as AppUserDoc
      )
    }

    return { created: true, id: cfg.appId, avatarUrl }
  }

  return { ensureApp }

  async function syncCoreAdminMembership(uid: string, role: AppRole) {
    try {
      const coreRef = doc(db, 'core-users', uid)
      const coreSnap = await getDoc(coreRef)
      if (!coreSnap.exists()) return

      const updates: Record<string, unknown> = {
        adminOf: arrayUnion(cfg.appId),
        updated_at: serverTimestamp(),
      }

      if (role !== 'global') {
        updates.userOf = arrayUnion(cfg.appId)
      }

      await updateDoc(coreRef, updates)
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[ensureApp] failed to sync core membership', error)
      }
    }
  }
}
