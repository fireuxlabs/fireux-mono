// packages/core/fireux-core/src/runtime/composables/users/useUserComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role } = useFireUXConfig()
  const isTenant = role === 'tenant'

  // Privacy helpers
  const looksLikeEmail = (v?: string) => !!v && v.includes('@')
  const safeDisplay = (vs: Array<string | undefined>, fallback: string) => {
    for (const v of vs) {
      if (!v) continue
      if (looksLikeEmail(v)) continue
      const t = v.trim()
      if (t) return t
    }
    return fallback
  }

  // Derived identity (no email fallbacks)
  const displayName = computed(() => {
    const u: any = user.value
    return safeDisplay(
      [
        u?.display_name,
        u?.app?.display_name,
        u?.core?.display_name,
        u?.app?.handle,
        u?.core?.handle,
        u?.id,
      ],
      'User'
    )
  })

  const avatarSrc = computed<string | undefined>(() => {
    const u: any = user.value
    return u?.app?.avatar || u?.core?.avatar || undefined
  })

  const initials = computed(() => {
    const name = displayName.value
    if (!name.trim()) return 'U'
    return name
      .trim()
      .split(/\s+/)
      .map((w) => w[0]?.toUpperCase() || '')
      .join('')
      .slice(0, 2)
  })

  const isSignedIn = computed(() => !!user.value)

  // Always for global
  const hasCoreUserProfile = computed(() => !!user.value?.core)

  // Only expose app profile flag if tenant
  const hasAppUserProfile = isTenant
    ? computed(() => !!user.value?.app)
    : undefined

  return {
    initials,
    displayName,
    avatarSrc,
    isSignedIn,
    hasCoreUserProfile,
    ...(isTenant ? { hasAppUserProfile } : {}),
  }
}
