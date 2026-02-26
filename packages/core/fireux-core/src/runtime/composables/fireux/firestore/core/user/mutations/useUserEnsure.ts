// Action: ENSURE · Phases: 1–4
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
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

    // Auth ensure must not demote existing admins to "user".
    // Preserve admin role if any current mirror already indicates admin.
    let membershipRole: 'admin' | 'user' = 'user'
    try {
      const db = useFirestore()
      const appUserSnap = await getDoc(doc(db, 'apps', appId, 'users', uid))
      const appRole = String((appUserSnap.data() as any)?.role ?? '').trim()
      const coreAdminOf = Array.isArray((core.snapshot?.data() as any)?.adminOf)
        ? ((core.snapshot?.data() as any)?.adminOf as Array<unknown>)
            .map((id) => String(id ?? '').trim())
            .filter(Boolean)
        : []
      if (appRole === 'admin' || coreAdminOf.includes(appId)) {
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

    const membership = await ensureUserAppMembership(appId, uid, membershipRole)

    return { createdCore: core.created, createdApp: membership.created, id: uid }
  }

  return { ensureUser }
}
