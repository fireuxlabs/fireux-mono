import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'
import { useFirestoreUpdate } from '../../../operations/useFirestoreUpdate.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

export function useUserUpdate(user: UserRefs) {
  const { updateDocument } = useFirestoreUpdate()
  const { appId } = useFireUXConfig()

  const core = user.coreUser as { value: User | undefined }
  const app = user.appUser as { value: AppUser | undefined }

  const updateDisplayName = async (display_name: string) => {
    const id = core.value?.id
    if (!id) throw new Error('[useUserUpdate] Missing core user id')
    await updateDocument('users', id, { display_name })
  }

  const updateAppRole = async (role: 'user' | 'admin') => {
    const id = app.value?.id
    if (!appId || !id)
      throw new Error('[useUserUpdate] Missing appId or app user id')
    await updateDocument(`apps/${appId}/users`, id, { role })
  }

  return {
    updateDisplayName,
    updateAppRole,
  }
}
