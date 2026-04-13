import { computed } from '#imports'
import type {
  AppUser,
  User,
} from '../../../../../../../models/core/user.model'
import { useFireUXConfig } from '../../../../../app/FireUXConfig'
import { useAvatarProxy } from '../../../../../app/ui/useAvatarProxy'
import { useAuth } from '../../../../../firebase/useAuth'
import type { UserRefs } from '../../fetch/useUserFetch'
import { useUserPermissions } from './useUserPermissions'

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
  const { appId } = useFireUXConfig()
  const { getProxiedAvatarUrl } = useAvatarProxy()
  const permissions = useUserPermissions(user)
  const requiresAppOverlay = computed(() => Boolean(String(appId || '').trim()))

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () =>
      isPending.value ||
      coreUser.value === undefined ||
      (requiresAppOverlay.value && appUser.value === undefined)
  )

  const isResolved = computed(
    () =>
      !isPending.value &&
      coreUser.value !== undefined &&
      (!requiresAppOverlay.value || appUser.value !== undefined)
  )
  const hasCoreUser = computed(() => coreUser.value !== null && coreUser.value !== undefined)
  const hasAppUser = computed(() => appUser.value !== null && appUser.value !== undefined)
  const isInitialized = computed(() => {
    if (!isResolved.value) return false
    if (!hasCoreUser.value) return false
    if (requiresAppOverlay.value && !hasAppUser.value) return false
    return true
  })
  const currentUser = computed(() => coreUser.value ?? null)

  const cta = computed((): UserCta => {
    if (!isAuthenticated.value || !uid.value) return CTA_SIGN_IN
    if (!isResolved.value) return CTA_AVATAR
    if (!hasCoreUser.value) return CTA_CREATE_CORE
    if (requiresAppOverlay.value && !hasAppUser.value) return CTA_JOIN_APP
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
    ...permissions,
    cta,
    hasProfile,
  }
}
