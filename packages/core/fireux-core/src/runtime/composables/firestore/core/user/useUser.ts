import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useUserFetch } from './main/useUserFetch.ts'
import { useUserComputed } from './main/useUserComputed.ts'
import { useUserEnsure } from './main/useUserEnsure.ts'
import { useUserUpdate } from './main/useUserUpdate.ts'
import { useUserDelete } from './main/useUserDelete.ts'
import { useUserInterface } from './main/useUserInterface.ts'

export type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export function useUser() {
  const { uid } = useAuth()
  const refs = useUserFetch(uid)
  const computed = useUserComputed(refs)
  const ui = useUserInterface(refs)
  const ensure = useUserEnsure(refs)
  const update = useUserUpdate(refs)
  const del = useUserDelete(refs)

  return {
    coreUser: refs.coreUser,
    appUser: refs.appUser,
    user: computed.currentUser,
    ...computed,
    ...ui,
    ...ensure,
    ...update,
    ...del,
  }
}
