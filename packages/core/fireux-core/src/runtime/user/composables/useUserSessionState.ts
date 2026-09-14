import { computed } from '#imports'
import { resolveUserAvatarSource } from '../utils/user-avatar'
import type { User } from '../models/user.model.ts'
import type { AppUserWithId } from '../../app/models/app-user.model.ts'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAvatarProxy } from '../../composables/media/useAvatarProxy'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import type { Ref } from 'vue'
import { useAppMembershipPolicy } from '../../app/composables/useAppMembershipPolicy'
import { useAppUserAccess } from '../../app/composables/useAppUserAccess'

export type ActiveUserOutcome =
  | 'loading'
  | 'error'
  | 'unauthenticated'
  | 'missing'
  | 'ready'

export function useUserSessionState(user: {
  coreUser: Ref<User | null | undefined>
  appUser: Ref<AppUserWithId | null | undefined>
  coreOutcome: Ref<'idle' | 'pending' | 'ready' | 'missing' | 'error'>
  coreError: Ref<unknown>
  appError: Ref<unknown>
  appPending: Ref<boolean>
  appOutcome: Ref<'idle' | 'pending' | 'ready' | 'missing' | 'error'>
}) {
  const coreUser = user.coreUser

  const {
    uid,
    isAuthenticated,
    hasAuthState,
    currentUser: authUserRef,
  } = useAuth()
  const { appId } = useFireUXConfig()
  const appPolicy = useAppMembershipPolicy(appId)
  const { canSelfJoin, pending: appPolicyPending } = appPolicy
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const permissions = useAppUserAccess(user)
  // User setup may create an App membership only where the current App owns a
  // self-service join policy. Invite-only Apps must not leave an otherwise
  // valid User in an onboarding loop they cannot complete.
  const coreOutcome = user.coreOutcome
  const coreError = user.coreError
  const appError = user.appError

  const isPending = computed(
    () =>
      appPolicyPending.value ||
      coreOutcome.value === 'pending' ||
      user.appPending.value
  )
  const error = computed<unknown>(() =>
    !hasAuthState.value || !isAuthenticated.value || !uid.value
      ? null
      : coreError.value || appPolicy.error.value || appError.value || null
  )
  const outcome = computed<ActiveUserOutcome>(() => {
    if (!hasAuthState.value) return 'loading'
    if (!isAuthenticated.value || !uid.value) return 'unauthenticated'
    if (error.value || coreOutcome.value === 'error') return 'error'
    if (
      isPending.value ||
      coreOutcome.value === 'idle' ||
      coreOutcome.value === 'pending' ||
      user.appOutcome.value === 'pending'
    ) {
      return 'loading'
    }
    if (coreOutcome.value === 'missing') return 'missing'
    return 'ready'
  })
  const pending = computed(() => outcome.value === 'loading')
  const currentUser = computed(() => coreUser.value ?? null)

  const avatarSrc = computed<string | undefined>(() => {
    const raw = coreUser.value?.avatar || authUserRef.value?.photoURL
    return getProxiedAvatarUrl(resolveUserAvatarSource(raw))
  })

  return {
    canSelfJoin,
    appPolicyPending,
    appPolicyError: appPolicy.error,
    currentUser,
    avatarSrc,
    outcome,
    error,
    pending,
    ...permissions,
  }
}
