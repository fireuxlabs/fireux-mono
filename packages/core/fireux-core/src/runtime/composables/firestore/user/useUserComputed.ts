// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export type HeaderState = 'sign-in' | 'create-core-user' | 'join-app' | 'avatar'
export interface NextCta {
  key: 'sign-in' | 'create-core-user' | 'join-app'
  label: string
  to: string
}

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role, appId } = useFireUXConfig()
  // Only treat as tenant when both role and appId are present
  const isTenant = role === 'tenant' && !!appId

  // Gates
  const isSignedIn = computed(() => !!user.value?.id)
  const hasCoreProfile = computed(() => !!user.value?.core)
  const hasAppProfile = computed(() => (isTenant ? !!user.value?.app : false))

  // Admin: app role OR global adminOf includes current app (or any app when global)
  const isAdmin = computed(() => {
    const u = user.value
    if (!u) return false
    if (u.app?.role === 'admin') return true
    const adminOf = u.core?.adminOf || []
    return isTenant && appId ? adminOf.includes(appId) : adminOf.length > 0
  })

  // Display fields (prefer app over core)
  const displayName = computed(
    () => user.value?.app?.display_name || user.value?.core?.display_name || ''
  )
  const handle = computed(
    () => user.value?.app?.handle || user.value?.core?.handle || ''
  )
  const avatarSrc = computed(
    () => user.value?.app?.avatar || user.value?.core?.avatar || ''
  )

  const initials = computed(() => {
    const name = displayName.value.trim()
    if (!name) return 'U'
    const parts = name.split(/\s+/)
    const a = parts[0]?.[0]?.toUpperCase() ?? ''
    const b = parts[1]?.[0]?.toUpperCase() ?? ''
    return a + b || a || 'U'
  })

  // Profile completeness (app-pref, fallback to core)
  const completeness = computed(() => {
    const u = user.value
    const defs = [
      { key: 'Name', val: u?.app?.display_name ?? u?.core?.display_name },
      { key: 'Avatar', val: u?.app?.avatar ?? u?.core?.avatar },
      { key: 'Handle', val: u?.app?.handle ?? u?.core?.handle },
      { key: 'Email', val: u?.core?.email }, // email is core-only
    ] as const

    const filled = defs.map((d) => ({
      label: d.key,
      filled: !!String(d.val ?? '').trim(),
    }))
    const filledCount = filled.filter((f) => f.filled).length
    const totalCount = filled.length
    const percent = Math.round((filledCount / Math.max(1, totalCount)) * 100)
    const missing = filled.filter((f) => !f.filled).map((f) => f.label)
    return { percent, filledCount, totalCount, missing }
  })

  // Header funnel logic
  // Global (not tenant): never suggest join-app
  // Tenant (role 'tenant' with appId): suggest join-app when core exists but tenant profile doesn't
  const headerState = computed<HeaderState>(() => {
    if (!isSignedIn.value) return 'sign-in'
    if (!hasCoreProfile.value) return 'create-core-user'
    if (isTenant && !hasAppProfile.value) return 'join-app'
    return 'avatar'
  })

  const nextCta = computed<NextCta | null>(() => {
    switch (headerState.value) {
      case 'sign-in':
        return { key: 'sign-in', label: 'Sign in', to: '/auth' }
      case 'create-core-user':
        return {
          key: 'create-core-user',
          label: 'Create Profile',
          to: '/onboarding',
        }
      case 'join-app':
        return { key: 'join-app', label: 'Join App', to: '/join' }
      default:
        return null
    }
  })

  return {
    // gates
    isSignedIn,
    hasCoreProfile,
    hasAppProfile,
    isAdmin,

    // display
    displayName,
    handle,
    avatarSrc,
    initials,

    // profile quality
    completeness,

    // header UX
    headerState,
    nextCta,
  }
}
