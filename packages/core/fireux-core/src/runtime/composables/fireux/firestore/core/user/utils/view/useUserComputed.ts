// Concurrent edit — 2026-07-19 17:35 CEST — Profile privacy pass: resolve public and app-private profile membership.
// Concurrent edit — 2026-07-20 23:18 CEST — Active User Outcome fix: keep auth, read error, and missing states distinct.
import { computed } from '#imports'
import type { User } from '../../../../../../../models/core/user.model'
import type { CurrentAppMembershipDto } from '../../../../../../../server/utils/public-projection/public-dto.types'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { useAvatarProxy } from '../../../../../app/ui/useAvatarProxy'
import { useAuth } from '../../../../../firebase/useAuth'
import type { UserRefs } from '../../fetch/useUserFetch'
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
  label: 'Create core user',
  to: '',
}
const CTA_JOIN_APP: UserCta = { key: 'join-app', label: 'Sync app membership', to: '' }
const CTA_AVATAR: UserCta = { key: 'avatar', label: '', to: '' }

export function useUserComputed(user: UserRefs, pending?: { value?: boolean }) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as {
    value: CurrentAppMembershipDto | null | undefined
  }

  const {
    uid,
    isAuthenticated,
    hasAuthState,
    currentUser: authUserRef,
  } = useAuth()
  const { appId } = useFireUXConfig()
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const permissions = useUserPermissions(user)
  const requiresAppMembership = computed(() => Boolean(String(appId || '').trim()))
  const coreOutcome = user.coreOutcome
  const coreError = user.coreError
  const appError = user.appError

  const isPending = computed(() => Boolean(pending?.value))
  const error = computed<unknown>(() =>
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
  const hasCoreUser = computed(() => coreUser.value !== null && coreUser.value !== undefined)
  const hasAppUser = computed(() => appUser.value !== null && appUser.value !== undefined)
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

  const hasProfile = (profileType: string) => {
    const key = (profileType ?? '').trim()
    if (!key) return false

    const profiles = [
      ...(appUser.value?.profiles ?? []),
    ]

    return profiles.includes(key)
  }

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
