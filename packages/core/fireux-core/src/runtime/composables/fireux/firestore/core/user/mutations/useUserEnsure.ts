import { useRouter } from 'vue-router'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { requireUid } from 'fireux-core/runtime/composables/fireux/firestore/utils/useEnsureCommon.ts'
import {
  ensureCoreUserDocument,
  ensureUserAppMembership,
  type EnsureMembershipResult,
  type EnsureCoreResult,
} from '../utils/ensureHelpers.ts'

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
  const { isTenant, appId, appName, ecosystem } = useFireUXConfig()
  let authContextPromise: Promise<EnsureAuthContext> | null = null

  const resolveAuthContext = async () => {
    if (!authContextPromise) {
      authContextPromise = requireUid().then(({ uid, auth }) => ({
        uid,
        email: auth?.email ?? '',
        displayName: auth?.displayName || 'New User',
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
    if (!isTenant || !appId) return { created: false }
    const { uid } = await resolveAuthContext()
    return ensureUserAppMembership(appId, uid, membershipRole, {
      appName,
    })
  }

  // Ensures the core doc first, then mirrors membership inside the active app.
  const ensureUser = async (
    options: EnsureUserOptions = {}
  ): Promise<EnsureUserResult> => {
    const membershipRole = options.membershipRole ?? 'user'
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
