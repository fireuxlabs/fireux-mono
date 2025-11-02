import type { Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import {
  ensureAppMembership as ensureAppMembershipDoc,
  ensureDoc,
  makeHandle,
} from '../../../utils/ensureCommon.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

type EnsureUserDocResult = {
  created: boolean
  id: string
  displayName: string
}
type EnsureMembershipResult = { created: boolean }

export function useUserEnsure(_user?: Ref<User | null | undefined>) {
  const router = useRouter()
  const { isTenant, appId } = useFireUXConfig()

  async function ensureUserDoc(): Promise<EnsureUserDocResult> {
    const { uid, auth } = await requireUid()
    const displayName = auth?.displayName || 'New User'
    const payload = {
      id: uid,
      email: auth?.email ?? '',
      display_name: displayName,
      handle: makeHandle(displayName, uid),
    } as Partial<User>

    const result = await ensureDoc<User>('users', uid, payload as User)

    if (!result.created) {
      const existing = result.snapshot?.data() as Partial<User> | undefined
      const resolvedDisplayName =
        existing?.display_name || auth?.displayName || 'User'
      return { created: false, id: uid, displayName: resolvedDisplayName }
    }

    return { created: true, id: uid, displayName }
  }

  async function ensureAppMembership(): Promise<EnsureMembershipResult> {
    if (!isTenant || !appId) return { created: false }

    const { uid } = await requireUid()
    const result = await ensureAppMembershipDoc(appId, uid, 'user')
    return { created: result.created }
  }

  async function ensureUser() {
    const core = await ensureUserDoc()
    const membership = await ensureAppMembership()

    if ((core.created || membership.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return {
      createdCore: core.created,
      createdApp: membership.created,
      id: core.id,
      displayName: core.displayName,
    } as const
  }

  return {
    ensureUser,
    ensureCoreUser: ensureUserDoc,
    ensureAppUser: ensureAppMembership,
    ensureUserDoc,
    ensureAppMembership,
  }
}
