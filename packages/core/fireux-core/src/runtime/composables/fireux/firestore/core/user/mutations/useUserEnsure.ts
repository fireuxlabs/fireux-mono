// Action: ENSURE · Phases: 1–4
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'fireux-core/runtime/composables/fireux/firestore/vuefire'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { requireUid } from '../../../utils/useEnsureCommon'
import {
  ensureCoreUserDocument,
  ensureUserAppMembership,
} from '../utils/ensureHelpers'

function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+$/.test(value)
}

function toPublicDisplayNameSeed(
  displayName?: string | null,
  email?: string | null
): string {
  const primary = String(displayName ?? '').trim()
  if (primary) {
    return looksLikeEmail(primary) ? primary.split('@')[0]?.trim() || '' : primary
  }

  const fallback = String(email ?? '').trim()
  if (!fallback) return ''
  return looksLikeEmail(fallback) ? fallback.split('@')[0]?.trim() || '' : fallback
}

export function useUserEnsure() {
  async function ensureUser(): Promise<{
    createdCore: boolean
    createdApp: boolean
    id: string
  }> {
    const { uid, auth } = await requireUid()
    const { appId } = useFireUXConfig()
    const core = await ensureCoreUserDocument(uid, {
      displayName: toPublicDisplayNameSeed(auth.displayName, auth.email),
      email: auth.email ?? '',
      avatar: auth.photoURL ?? '',
    })

    // Sign-in should not mutate existing membership/admin roles.
    // Only ensure app membership when the app-scoped overlay is missing.
    let membershipRole: 'admin' | 'user' = 'user'
    let shouldEnsureMembership = true
    let appExists = false
    try {
      const db = useFirestore()
      const [appUserSnap, appSnap] = await Promise.all([
        getDoc(doc(db, 'apps', appId, 'users', uid)),
        getDoc(doc(db, 'apps', appId)),
      ])
      appExists = appSnap.exists()

      if (appUserSnap.exists()) {
        shouldEnsureMembership = false
      }

      if (!appExists) {
        shouldEnsureMembership = false
        if (import.meta.dev) {
          console.warn('[useUserEnsure] app doc missing; skipping membership ensure', {
            uid,
            appId,
          })
        }
      }

      const coreAdminOf = Array.isArray((core.snapshot?.data() as any)?.adminOf)
        ? ((core.snapshot?.data() as any)?.adminOf as Array<unknown>)
            .map((id) => String(id ?? '').trim())
            .filter(Boolean)
        : []
      const appAdminIds = Array.isArray((appSnap.data() as any)?.admin_ids)
        ? ((appSnap.data() as any)?.admin_ids as Array<unknown>)
            .map((id) => String(id ?? '').trim())
            .filter(Boolean)
        : []

      // If we do need to create the overlay, preserve admin role only when
      // existing admin mirrors already say this user is an admin.
      if (appExists && (coreAdminOf.includes(appId) || appAdminIds.includes(uid))) {
        membershipRole = 'admin'
      }
    } catch (error) {
      if (import.meta.dev) {
        console.warn('[useUserEnsure] failed to inspect existing membership role', {
          uid,
          appId,
          error,
        })
      }
    }

    const membership = shouldEnsureMembership
      ? await ensureUserAppMembership(appId, uid, membershipRole)
      : { created: false }

    return { createdCore: core.created, createdApp: membership.created, id: uid }
  }

  return { ensureUser }
}
