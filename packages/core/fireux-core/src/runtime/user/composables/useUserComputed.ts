// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: resolve public and app-private profile membership.
// Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: keep auth, read error, and missing states distinct.
import { computed } from '#imports'
import type { User } from '../models/user.model.ts'
import type { AppUserWithId } from '../../app/models/app-user.model.ts'
import { useFireUXConfig } from '../../app/composables/config/FireUXConfig'
import { useAvatarProxy } from '../../composables/media/useAvatarProxy'
import { useAuth } from '../../composables/fireux/firebase/useAuth'
import type { UserSessionRead } from './useUserSessionRead'
import type { AppUserSessionRead } from '../../app/composables/useAppUserSessionRead'
import { useUserPermissions } from './useUserPermissions'

export type ActiveUserOutcome =
  | 'loading'
  | 'error'
  | 'unauthenticated'
  | 'missing'
  | 'ready'

type UserCtaKey = 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'

type UserCta = {
  key: UserCtaKey
  label: string
  to: string
}

const CTA_SIGN_IN: UserCta = { key: 'sign-in', label: 'Sign in', to: '/auth' }
const CTA_CREATE_CORE: UserCta = {
  key: 'create-core-user',
  label: 'Create my User',
  to: '',
}
const CTA_JOIN_APP: UserCta = {
  key: 'join-app',
  label: 'Connect to App',
  to: '',
}
const CTA_AVATAR: UserCta = { key: 'avatar', label: '', to: '' }

export function useUserComputed(
  user: UserSessionRead & AppUserSessionRead,
  pending?: { value?: boolean }
) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as {
    value: AppUserWithId | null | undefined
  }

  const {
    uid,
    isAuthenticated,
    hasAuthState,
    currentUser: authUserRef,
  } = useAuth()
  const { appId, selfJoinEnabled } = useFireUXConfig()
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const permissions = useUserPermissions(user)
  // User setup may create an App membership only where the current App owns a
  // self-service join policy. Invite-only Apps must not leave an otherwise
  // valid User in an onboarding loop they cannot complete.
  const requiresAppMembership = computed(
    () => Boolean(String(appId || '').trim()) && selfJoinEnabled
  )
  const coreOutcome = user.coreOutcome
  const coreError = user.coreError
  const appError = user.appError

  const isPending = computed(
    () =>
      coreOutcome.value === 'pending' ||
      (requiresAppMembership.value && Boolean(user.appPending.value)) ||
      Boolean(pending?.value && coreOutcome.value === 'idle')
  )
  const error = computed<unknown>(
    () =>
      coreError.value ||
      (requiresAppMembership.value ? appError.value : null) ||
      null
  )
  const outcome = computed<ActiveUserOutcome>(() => {
    if (!hasAuthState.value) return 'loading'
    if (!isAuthenticated.value || !uid.value) return 'unauthenticated'
    if (error.value || coreOutcome.value === 'error') return 'error'
    if (
      isPending.value ||
      coreOutcome.value === 'idle' ||
      coreOutcome.value === 'pending' ||
      (requiresAppMembership.value && appUser.value === undefined)
    ) {
      return 'loading'
    }
    if (coreOutcome.value === 'missing') return 'missing'
    return 'ready'
  })
  const isLoading = computed(() => outcome.value === 'loading')
  const isMissing = computed(() => outcome.value === 'missing')

  const isResolved = computed(
    () => outcome.value !== 'loading' && outcome.value !== 'error'
  )
  const hasCoreUser = computed(
    () => coreUser.value !== null && coreUser.value !== undefined
  )
  const hasAppUser = computed(
    () => appUser.value !== null && appUser.value !== undefined
  )
  const isInitialized = computed(() => {
    if (outcome.value !== 'ready') return false
    if (!hasCoreUser.value) return false
    if (requiresAppMembership.value && !hasAppUser.value) return false
    return true
  })
  const currentUser = computed(() => coreUser.value ?? null)

  const cta = computed((): UserCta => {
    if (!isAuthenticated.value || !uid.value) return CTA_SIGN_IN
    if (!isResolved.value) return CTA_AVATAR
    if (!hasCoreUser.value) return CTA_CREATE_CORE
    if (requiresAppMembership.value && !hasAppUser.value) return CTA_JOIN_APP
    return CTA_AVATAR
  })

  // Profile presence belongs to each profile Entity; AppUser does not own it.
  const hasProfile = (_profileType: string) => false

  const avatarSrc = computed<string | undefined>(() => {
    const raw = coreUser.value?.avatar || authUserRef.value?.photoURL
    const normalized = typeof raw === 'string' ? raw.trim() : ''
    const proxied = getProxiedAvatarUrl(normalized || undefined)
    return proxied || undefined
  })

  return {
    currentUser,
    avatarSrc,
    outcome,
    error,
    isLoading,
    isMissing,
    isResolved,
    isInitialized,
    ...permissions,
    cta,
    hasProfile,
  }
}
