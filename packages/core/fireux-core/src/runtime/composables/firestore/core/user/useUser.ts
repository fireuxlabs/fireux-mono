import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'
import { useUserComputed } from './main/useUserComputed'
import { useUserEnsure } from './main/useUserEnsure'
import { useUserUpdate } from './main/useUserUpdate'
import { useUserDelete } from './main/useUserDelete'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useUser() {
  const { uid } = useAuth()
  const { user } = useUserFetch(uid)

  return {
    user,
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserUpdate(user),
    ...useUserDelete(user),
  }
}
