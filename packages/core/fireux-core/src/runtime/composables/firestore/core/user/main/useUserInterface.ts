// FILE: ~/composables/user/useUserInterface.ts
import type { Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'

export function useUserInterface(
  source?: Ref<User | null | undefined> | UserRefs
) {
  const resolve = (): User | null => {
    if (!source) return null
    if ('coreUser' in (source as UserRefs)) {
      return (source as UserRefs).coreUser.value ?? null
    }
    return (source as Ref<User | null | undefined>).value ?? null
  }

  const toPath = (id?: string | null) => (id ? `/users/${id}` : '')
  const subtitle = (handle?: string | null) => (handle ? `@${handle}` : '')
  const badgeList = (value?: unknown): string[] => {
    if (!Array.isArray(value)) return []
    const filtered = value
      .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
      .filter((entry) => entry.length > 0)
    return Array.from(new Set(filtered))
  }
  const toInitials = (value?: string | null): string | undefined => {
    const input = (value ?? '').trim()
    if (!input) return undefined
    return input
      .split(/\s+/)
      .map((token) => token[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const pillProps = (target?: User | null): UserCard.Pill => {
    const user = target ?? resolve()
    const displayName =
      user?.display_name?.trim() ||
      user?.handle?.trim() ||
      user?.id?.trim() ||
      ''

    return {
      avatar: user?.avatar ?? '',
      initials: toInitials(displayName),
      title: displayName,
      subtitle: subtitle(user?.handle),
      badges: badgeList(user?.profiles),
      to: (toPath(user?.id) || null) as RouteLocationRaw,
    }
  }

  return { pillProps }
}
