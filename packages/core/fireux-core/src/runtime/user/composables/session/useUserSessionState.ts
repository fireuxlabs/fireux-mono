import type { ReadOutcome } from '../../../utils/read-outcome'
import { computed } from '#imports'
import { resolveUserAvatarSource } from '../../utils/user-avatar'
import type { User } from '../../models/user.model.ts'
import type { AppUserWithId } from '../../../app/app-user/types.ts'
import { useAvatarProxy } from '../../../composables/media/useAvatarProxy'
import type { useAuth } from '../../../composables/fireux/firebase/useAuth'
import type { Ref } from 'vue'
import { useAppUserAccess } from '../../../app/app-user/composables/useAppUserAccess'

export type ActiveUserOutcome =
  | 'loading'
  | 'error'
  | 'unauthenticated'
  | 'empty'
  | 'ready'

export function useUserSessionState(
  source: {
    user: Ref<User | null | undefined>
    appUser: Ref<AppUserWithId | null | undefined>
    userOutcome: Ref<ReadOutcome>
    userError: Ref<unknown>
    appUserError: Ref<unknown>
    appUserPending: Ref<boolean>
    appUserOutcome: Ref<ReadOutcome>
  },
  auth: Pick<
    ReturnType<typeof useAuth>,
    'uid' | 'isAuthenticated' | 'hasAuthState' | 'currentUser'
  >
) {
  const user = source.user

  const { uid, isAuthenticated, hasAuthState, currentUser: authUserRef } = auth
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const permissions = useAppUserAccess({
    appUser: source.appUser,
    appOutcome: source.appUserOutcome,
  })
  const userOutcome = source.userOutcome
  const userError = source.userError
  const appUserError = source.appUserError

  const isPending = computed(
    () => userOutcome.value === 'pending' || source.appUserPending.value
  )
  const error = computed<unknown>(() =>
    !hasAuthState.value || !isAuthenticated.value || !uid.value
      ? null
      : userError.value || appUserError.value || null
  )
  const outcome = computed<ActiveUserOutcome>(() => {
    if (!hasAuthState.value) return 'loading'
    if (!isAuthenticated.value || !uid.value) return 'unauthenticated'
    if (error.value || userOutcome.value === 'error') return 'error'
    if (
      isPending.value ||
      userOutcome.value === 'idle' ||
      userOutcome.value === 'pending' ||
      source.appUserOutcome.value === 'pending'
    ) {
      return 'loading'
    }
    if (userOutcome.value === 'empty') return 'empty'
    return 'ready'
  })
  const pending = computed(() => outcome.value === 'loading')

  const avatarSrc = computed<string | undefined>(() => {
    const raw = user.value?.avatar || authUserRef.value?.photoURL
    return getProxiedAvatarUrl(resolveUserAvatarSource(raw))
  })

  return {
    avatarSrc,
    outcome,
    error,
    pending,
    ...permissions,
  }
}
