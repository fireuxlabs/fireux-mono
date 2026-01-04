import { useRouter } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { useFirestore } from 'vuefire'
import { useFireUXConfig } from '../../../../app/FireUXConfig'
import { requireUid } from '../../../utils/useEnsureCommon'
import {
  ensureCoreUserDocument,
  ensureUserAppMembership,
  type EnsureMembershipResult,
  type EnsureCoreResult,
} from '../utils/ensureHelpers'

type EnsureAppOutcome = EnsureMembershipResult

type EnsureUserResult = {
  createdCore: boolean
  createdApp: boolean
  id: string
  displayName: string
}

type EnsureUserOptions = {
  /** When false, skip the automatic redirect after provisioning. */
  redirect?: boolean
  /** Optional override for where to send a new user (defaults to /dashboard). */
  redirectTo?: string
  /** Membership role to ensure inside the tenant scope. */
  membershipRole?: MembershipRole
}

type MembershipRole = 'admin' | 'user'

type EnsureAuthContext = {
  uid: string
  email: string
  displayName: string
}

type EnsureCoreOutcome = EnsureCoreResult & { id: string }
const DEFAULT_REDIRECT = '/dashboard'

// Ensures core user + app membership; used by auth and profile flows.
export function useAppUserEnsure() {
  const router = useRouter()
  const { appId, ecosystem } = useFireUXConfig()
  const db = useFirestore()
  let authContextPromise: Promise<EnsureAuthContext> | null = null

  const resolveAuthContext = async () => {
    if (!authContextPromise) {
      authContextPromise = requireUid().then(({ uid, auth }) => ({
        uid,
        email: (() => {
          const value = auth?.email
          if (!value) throw new Error('[useUserEnsure] Missing auth email')
          return value
        })(),
        displayName: (() => {
          const value = auth?.displayName
          if (!value) throw new Error('[useUserEnsure] Missing auth displayName')
          return value
        })(),
      }))
    }
    return authContextPromise
  }

  const ensureCore = async (): Promise<EnsureCoreOutcome> => {
    const context = await resolveAuthContext()
    const result = await ensureCoreUserDocument(context.uid, {
      displayName: context.displayName,
      email: context.email,
      ecosystemName: ecosystem,
    })
    return { ...result, id: context.uid }
  }

  // App docs mirror the core UID under /apps/{appId}/users/{uid} to grant tenant membership.
  const ensureApp = async (
    membershipRole: MembershipRole = 'user'
  ): Promise<EnsureAppOutcome> => {
    const { uid } = await resolveAuthContext()
    if (!appId) throw new Error('[useUserEnsure] Missing config.appId')

    // IMPORTANT: never downgrade an existing admin to user as a side effect of
    // “ensure user” flows (auth/profile). Explicit admin toggles should use the
    // dedicated admin mutation helpers.
    if (membershipRole === 'user') {
      const existing = await getDoc(doc(db, 'apps', appId, 'users', uid))
      const currentRole = existing.exists() ? (existing.data() as any)?.role : null
      if (currentRole === 'admin') {
        return ensureUserAppMembership(appId, uid, 'admin')
      }
    }

    return ensureUserAppMembership(appId, uid, membershipRole)
  }

  // Ensures the core doc first, then mirrors membership inside the active app.
  const ensureUser = async (
    options: EnsureUserOptions = {}
  ): Promise<EnsureUserResult> => {
    const membershipRole = options.membershipRole ?? 'user'
    if (!ecosystem) throw new Error('[useUserEnsure] Missing config.ecosystem')
    const core = await ensureCore()
    const app = await ensureApp(membershipRole)

    if (
      options.redirect !== false &&
      (core.created || app.created) &&
      import.meta.client
    ) {
      router.push(options.redirectTo ?? DEFAULT_REDIRECT)
    }

    return {
      createdCore: core.created,
      createdApp: app.created,
      id: core.id,
      displayName: core.displayName,
    }
  }

  return { ensureUser, ensureCore, ensureApp, getAuthContext: resolveAuthContext }
}
export { useAppUserEnsure as useUserEnsure }
