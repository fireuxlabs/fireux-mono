// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/main/useUserComputed.ts
import { computed } from 'vue'
import type { Ref } from 'vue'
import { useAuth } from 'fireux-core/runtime/composables/firebase/useAuth.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type {
  User,
  AppUser,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from './useUserFetch.ts'

type UserCtaKey = 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'

type UserCta = {
  key: UserCtaKey
  label: string
  to: string
}

const CTA_CONFIG: Record<UserCtaKey, UserCta> = {
  'sign-in': {
    key: 'sign-in',
    label: 'Sign in',
    to: '/auth',
  },
  'create-core-user': {
    key: 'create-core-user',
    label: 'Complete sign up',
    to: '/auth',
  },
  'join-app': {
    key: 'join-app',
    label: 'Finish tenant sign up',
    to: '/auth',
  },
  avatar: {
    key: 'avatar',
    label: '',
    to: '',
  },
}

export function useUserComputed(user: UserRefs, pending?: Ref<boolean>) {
  const coreUser = user.coreUser as { value: User | null | undefined }
  const appUser = user.appUser as { value: AppUser | null | undefined }

  const { uid, isAuthenticated } = useAuth()
  const { role, appId } = useFireUXConfig()

  const isTenant = computed(
    () => role === 'tenant' && typeof appId === 'string' && appId.length > 0
  )

  const isPending = computed(() => Boolean(pending?.value))
  const isLoading = computed(
    () => isPending.value || coreUser.value === undefined
  )
  const currentUser = computed(() => coreUser.value ?? null)
  const hasCoreProfile = computed(() => Boolean(coreUser.value))
  const hasAppProfile = computed(() => Boolean(appUser.value))

  const profileKeys = computed(() => {
    const core = coreUser.value
    if (!core) return [] as string[]

    const profiles = Array.isArray(core.profiles) ? core.profiles : []
    return profiles.filter(
      (key): key is string => typeof key === 'string' && key.length > 0
    )
  })

  const resolveCtaKey = computed<UserCtaKey>(() => {
    if (!isAuthenticated.value && !uid.value) return 'sign-in'
    if (!hasCoreProfile.value) return 'create-core-user'
    if (isTenant.value && !hasAppProfile.value) return 'join-app'
    return 'avatar'
  })

  const isAdmin = computed(() => {
    if (appUser.value?.role === 'admin') return true

    const core = coreUser.value
    if (!core) return false

    const adminOf = Array.isArray(core.adminOf) ? core.adminOf : []
    if (!adminOf.length) return false

    if (!isTenant.value) return adminOf.length > 0
    return appId ? adminOf.includes(appId) : adminOf.length > 0
  })

  const cta = computed<UserCta>(() => CTA_CONFIG[resolveCtaKey.value])

  const hasProfile = (profileType: string): boolean =>
    profileKeys.value.includes(profileType)

  return {
    currentUser,
    isLoading,
    isPending,
    hasCoreProfile,
    isAdmin,
    cta,
    profileKeys,
    hasProfile,
  }
}
