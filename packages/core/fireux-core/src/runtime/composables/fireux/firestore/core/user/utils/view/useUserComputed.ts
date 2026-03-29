import { computed } from '#imports'
import type {
    AppUser,
    User,
} from '../../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { useAvatarProxy } from '../../../../../app/ui/useAvatarProxy'
import { useAuth } from '../../../../../firebase/useAuth'
import type { UserRefs } from '../../fetch/useUserFetch'

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
const CTA_JOIN_APP: UserCta = { key: 'join-app', label: 'Join app', to: '' }
const CTA_AVATAR: UserCta = { key: 'avatar', label: '', to: '' }

export function useUserComputed(user: UserRefs, pending?: { value?: boolean }) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  const { uid, isAuthenticated, currentUser: authUserRef } = useAuth()
  const { isTenant, appId } = useFireUXConfig()
  const { getProxiedAvatarUrl } = useAvatarProxy()

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () =>
      isPending.value ||
      coreUser.value === undefined ||
      (isTenant && appUser.value === undefined)
  )

  const isResolved = computed(
    () =>
      !isPending.value &&
      coreUser.value !== undefined &&
      (!isTenant || appUser.value !== undefined)
  )
  const hasCoreUser = computed(() => coreUser.value !== null && coreUser.value !== undefined)
  const hasAppUser = computed(() => appUser.value !== null && appUser.value !== undefined)
  const isInitialized = computed(() => {
    if (!isResolved.value) return false
    if (!hasCoreUser.value) return false
    if (isTenant && !hasAppUser.value) return false
    return true
  })
  const currentUser = computed(() => coreUser.value ?? null)

  const isAdmin = computed(() => {
    if (appUser.value?.role === 'admin') return true

    const activeAppId = appId?.trim()
    if (!activeAppId) return false

    // Fall back to core app membership so admin UI works when app overlay
    // docs are missing or still onboarding.
    return Boolean(coreUser.value?.adminOf?.some((id) => id === activeAppId))
  })

  const cta = computed((): UserCta => {
    if (!isAuthenticated.value || !uid.value) return CTA_SIGN_IN
    if (!isResolved.value) return CTA_AVATAR
    if (!hasCoreUser.value) return CTA_CREATE_CORE
    if (isTenant && !hasAppUser.value) return CTA_JOIN_APP
    return CTA_AVATAR
  })

  const hasProfile = (profileType: string) => {
    const key = (profileType ?? '').trim()
    if (!key) return false

    const profiles = coreUser.value?.profiles
    if (!Array.isArray(profiles)) return false

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
    isLoading,
    isResolved,
    isInitialized,
    isAdmin,
    cta,
    hasProfile,
  }
}
