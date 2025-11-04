import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'
import { useUserComputed } from './main/useUserComputed.ts'
import { useUserEnsure } from './main/useUserEnsure.ts'
import { useUserUpdate } from './main/useUserUpdate.ts'
import { useUserDelete } from './main/useUserDelete.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useUser() {
  const { uid } = useAuth() 
  const { user } = useUserFetch(uid.value) 

  return {
    user,
    ...useUserComputed(user),
    ...useUserEnsure(user),
    ...useUserUpdate(user),
    ...useUserDelete(user),
  }
}
