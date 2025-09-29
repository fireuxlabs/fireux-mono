// packages/core/fireux-core/src/runtime/composables/firestore/user/useUserComputed.ts
import { computed, type Ref } from 'vue'
import { useFireUXConfig } from '../../FireUXConfig'
import type { User } from '../../../models/core/user.model'

export function useUserComputed(user: Ref<User | null | undefined>) {
  const { role, appId } = useFireUXConfig()
  const isTenant = role === 'tenant'

  const hasCoreProfile = computed(() => !!user.value?.core)
  const hasAppProfile = isTenant ? computed(() => !!user.value?.app) : undefined

  // 🔹 Admin if: role === 'admin' OR adminOf includes current app (or any app globally)
  const isAdmin = computed(() => {
    const u = user.value
    if (!u) return false

    if (u.app?.role === 'admin') return true

    const adminOf = u.core?.adminOf || []
    return isTenant && appId ? adminOf.includes(appId) : adminOf.length > 0
  })

  // 🔹 Display name fallback: app > core > email username
  const displayName = computed(() => {
    const u = user.value
    if (!u) return ''
    return u.app?.display_name || u.core?.display_name || ''
  })

  const initials = computed(() => {
    const parts = (displayName.value || '').trim().split(/\s+/)
    return (parts[0]?.[0] || '').toUpperCase() + (parts[1]?.[0] || '')
  })

  // 🔹 Profile completeness across canonical fields (prefers app values, falls back to core)
  // Fields considered: display_name, avatar, handle, email (email from core only)
  const completeness = computed(() => {
    // For now, return a fixed 50% while preserving detail fields
    const u = user.value
    const defs = [
      {
        label: 'Name',
        get: () => u?.app?.display_name || u?.core?.display_name || '',
      },
      {
        label: 'Avatar',
        get: () => u?.app?.avatar || u?.core?.avatar || '',
      },
      {
        label: 'Handle',
        get: () => u?.app?.handle || u?.core?.handle || '',
      },
      {
        label: 'Email',
        get: () => u?.core?.email || '',
      },
    ] as const

    const filled = defs.map((d) => ({
      label: d.label,
      filled: !!String(d.get() || '').trim(),
    }))
    const filledCount = filled.filter((f) => f.filled).length
    const totalCount = filled.length
    const missing = filled.filter((f) => !f.filled).map((f) => f.label)

    return { percent: 50, filledCount, totalCount, missing }
  })

  return {
    hasCoreProfile,
    ...(isTenant ? { hasAppProfile } : {}),
    isAdmin,
    displayName,
    initials,
    completeness,
  }
}
