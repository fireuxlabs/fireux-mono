import { useAuth } from '../../composables/fireux/firebase/useAuth'
import { useCurrentAppUserRead } from '../../app/composables/firestore/fetch/useAppUserRead'
import { useUserSessionRead } from './firestore/fetch/useUserRead'
import { useUserBootstrap } from './firestore/mutations/useUserCreate'
import { useUserDeletion } from './useUserDeletion'
import { useUserProfileUpdate } from './firestore/mutations/useUserUpdate'
import { useUserComputed } from './useUserComputed'
import { useUserInterface } from './useUserInterface'

/** Active authentication, private account, and current-App membership. */
export function useUserSession() {
  const { uid } = useAuth()
  const core = useUserSessionRead(uid, { account: true })
  const app = useCurrentAppUserRead(uid)
  const refs = { ...core, ...app }
  const { bootstrapUser } = useUserBootstrap()
  const { update: updateUser } = useUserProfileUpdate(refs)
  const deletion = useUserDeletion()

  return {
    ...refs,
    create: bootstrapUser,
    update: updateUser,
    deletion,
    ...useUserComputed(refs, refs.pending),
    ...useUserInterface(refs.user),
  }
}
