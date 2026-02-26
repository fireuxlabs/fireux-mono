// Action: ENSURE · Phases: 1–4
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

    const membership = await ensureUserAppMembership(appId, uid, 'user')

    return { createdCore: core.created, createdApp: membership.created, id: uid }
  }

  return { ensureUser }
}
