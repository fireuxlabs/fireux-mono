import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useAppUserSessionRead } from '../../app/composables/useAppUserSessionRead'
import { useUserSessionRead } from './useUserSessionRead'
import { useUserBootstrap } from './useUserBootstrap'
import { useUserDelete } from './useUserDelete'
import { useUserProfileUpdate } from './firestore/mutations/useUserUpdate'
import { useUserComputed } from './useUserComputed'
import { useUserInterface } from './useUserInterface'

/** Active authentication, private account, and current-App membership. */
export function useUserSession() {
  const { uid } = useAuth()
  const core = useUserSessionRead(uid, { account: true })
  const app = useAppUserSessionRead(uid)
  const refs = { ...core, ...app }
  const { bootstrapUser } = useUserBootstrap()
  const { update: updateUser } = useUserProfileUpdate(refs)
  const { deleteUser } = useUserDelete()

  return {
    ...refs,
    create: bootstrapUser,
    update: updateUser,
    delete: () => deleteUser(uid.value || ''),
    ...useUserComputed(refs, refs.pending),
    ...useUserInterface(refs.user),
  }
}
