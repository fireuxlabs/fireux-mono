// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserComputed.ts
import { computed } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

export type HeaderState = 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'

export type NextCta = {
  key: HeaderState
  label: string
  to: string
}

const CTA_MAP: Record<HeaderState, NextCta> = {
  'sign-in': {
    key: 'sign-in',
    label: 'Sign in',
    to: '/auth',
  },
  'create-core-user': {
    key: 'create-core-user',
    label: 'Create Profile',
    to: '/onboarding',
  },
  'join-app': {
    key: 'join-app',
    label: 'Join App',
    to: '/join',
  },
  avatar: {
    key: 'avatar',
    label: '',
    to: '',
  },
}

export function useUserComputed(user: UserRefs) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  const { uid, isAuthenticated } = useAuth()
  const { role, appId } = useFireUXConfig()

  const isTenant = computed(
    () => role === 'tenant' && typeof appId === 'string' && appId.length > 0
  )

  const isLoading = computed(() => coreUser.value === undefined)
  const currentUser = computed(() => coreUser.value ?? null)
  const hasCoreProfile = computed(() => Boolean(coreUser.value))
  const hasAppProfile = computed(() => Boolean(appUser.value))
  const hasAnyProfile = computed(
    () => hasCoreProfile.value || hasAppProfile.value
  )

  const isSignedIn = computed(() => isAuthenticated.value || Boolean(uid.value))

  const isAdmin = computed(() => {
    if (appUser.value?.role === 'admin') return true

    const core = coreUser.value
    if (!core) return false

    const adminOf = Array.isArray(core.adminOf) ? core.adminOf : []
    if (!adminOf.length) return false

    if (!isTenant.value) return adminOf.length > 0
    return appId ? adminOf.includes(appId) : adminOf.length > 0
  })

  const headerState = computed<HeaderState>(() => {
    if (!isSignedIn.value) return 'sign-in'
    if (!hasCoreProfile.value) return 'create-core-user'
    if (isTenant.value && !hasAppProfile.value) return 'join-app'
    return 'avatar'
  })

  const cta = computed<NextCta>(() => CTA_MAP[headerState.value])

  const hasProfile = (profileType: string): boolean => {
    const core = coreUser.value
    if (!core) return false
    const profiles = Array.isArray(core.profiles) ? core.profiles : []
    return profiles.includes(profileType)
  }

  return {
    currentUser,
    isLoading,
    hasCoreProfile,
    hasAppProfile,
    hasAnyProfile,
    isSignedIn,
    isAdmin,
    headerState,
    cta,
    hasProfile,
  }
}
