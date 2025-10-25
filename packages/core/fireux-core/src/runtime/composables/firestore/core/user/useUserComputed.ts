// FILE: packages/core/fireux-core/src/runtime/composables/firestore/core/user/useUserComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'
import type { User } from 'fireux-core/runtime/models/core/user.model.ts'

export interface UserCta {
  key: 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'
  label: string
  to?: string
}

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { isTenant, appId } = useFireUXConfig()

  const isSignedIn = computed(() => Boolean(user.value?.id))
  const hasCoreProfile = computed(() => Boolean(user.value?.core))
  const hasAppProfile = computed(() => (isTenant ? Boolean(user.value?.app) : false))

  const isAdmin = computed(() => {
    const u = user.value
    if (!u) return false
    if (isTenant) {
      if (u.app?.role === 'admin') return true
      return Boolean(appId && u.core?.adminOf?.includes(appId))
    }
    return (u.core?.adminOf?.length ?? 0) > 0
  })

  const initials = computed(() => {
    const name = user.value?.display_name?.trim() ?? ''
    if (!name) return 'U'
    const [a = '', b = ''] = name.split(/\s+/)
    return ((a[0] ?? '') + (b[0] ?? '') || a[0] || 'U').toUpperCase()
  })

  // Unified CTA logic for all views (header, dashboard, index, etc.)
  const cta = computed<UserCta>(() => {
    if (!isSignedIn.value)
      return { key: 'sign-in', label: 'Sign in', to: '/auth' }

    if (!hasCoreProfile.value)
      return { key: 'create-core-user', label: 'Create profile', to: '/onboarding' }

    if (isTenant && !hasAppProfile.value)
      return { key: 'join-app', label: 'Join this app', to: '/join' }

    return { key: 'avatar', label: 'Profile' } // final fallback (no to)
  })

  const badges = computed(() => {
    return (target?: User | null): string[] => {
      if (!target) return []
      if (isTenant) {
        if (target.app?.role === 'admin') return ['admin']
        if (appId && target.core?.adminOf?.includes(appId)) return ['admin']
        return []
      }
      return (target.core?.adminOf?.length ?? 0) > 0 ? ['admin'] : []
    }
  })

  return {
    isSignedIn,
    hasCoreProfile,
    hasAppProfile,
    isAdmin,
    initials,
    cta,     // unified call-to-action state
    badges,
  }
}