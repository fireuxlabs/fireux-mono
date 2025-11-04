import { useRouter } from 'vue-router'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import { requireUid } from '../../../utils/useEnsureCommon.ts'
import {
  ensureAppMembership as ensureAppMembershipDoc,
  ensureDoc,
  makeHandle,
} from '../../../utils/ensureCommon.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

type EnsureUserResult = {
  createdCore: boolean
  createdApp: boolean
  id: string
  displayName: string
}

export function useUserEnsure(_user?: UserRefs) {
  const router = useRouter()
  const { isTenant, appId } = useFireUXConfig()

  const ensureCore = async (): Promise<{
    created: boolean
    id: string
    displayName: string
  }> => {
    const { uid, auth } = await requireUid()
    const displayName = auth?.displayName || 'New User'

    const payload: Partial<User> = {
      id: uid,
      email: auth?.email ?? '',
      display_name: displayName,
      handle: makeHandle(displayName, uid),
    }

    const result = await ensureDoc<User>('users', uid, payload as User)

    if (!result.created) {
      const existing = result.snapshot?.data() as Partial<User> | undefined
      const resolvedDisplayName = existing?.display_name || displayName
      return { created: false, id: uid, displayName: resolvedDisplayName }
    }

    return { created: true, id: uid, displayName }
  }

  const ensureApp = async (): Promise<{ created: boolean }> => {
    if (!isTenant || !appId) return { created: false }
    const { uid } = await requireUid()
    const result = await ensureAppMembershipDoc(appId, uid, 'user')
    return { created: result.created }
  }

  const ensureUser = async (): Promise<EnsureUserResult> => {
    const core = await ensureCore()
    const app = await ensureApp()

    if ((core.created || app.created) && import.meta.client) {
      router.push('/dashboard')
    }

    return {
      createdCore: core.created,
      createdApp: app.created,
      id: core.id,
      displayName: core.displayName,
    }
  }

  return { ensureUser, ensureCore, ensureApp }
}
