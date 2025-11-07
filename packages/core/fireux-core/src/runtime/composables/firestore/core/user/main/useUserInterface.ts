// FILE: ~/composables/user/useUserInterface.ts
import type { Ref } from 'vue'
import type { RouteLocationRaw } from 'vue-router'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

const DEFAULT_INITIALS = 'A'

const initialsFor = (name?: string | null): string => {
  const t = (name ?? '').trim()
  return t ? t.charAt(0).toUpperCase() : DEFAULT_INITIALS
}

const subtitleFor = (handle?: string | null): string =>
  handle ? `@${handle}` : ''

const toUserPath = (id?: string | null): string => (id ? `/users/${id}` : '')

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

  const pillProps = (target?: User | null): Pill.Props => {
    const user = target ?? resolve()
    const title = user?.display_name ?? ''

    return {
      avatar: user?.avatar ?? '',
      initials: initialsFor(title),
      title,
      subtitle: subtitleFor(user?.handle),
      badges: user?.profiles ?? [],
      to: (toUserPath(user?.id) || null) as RouteLocationRaw,
    }
  }

  // NOTE: In User model, Cell EXTENDS Pill (unlike App), so including pill fields is correct.
  const cellProps = (target?: User | null): UserCard.Cell => {
    const user = target ?? resolve()
    const title = user?.display_name ?? ''

    return {
      avatar: user?.avatar ?? '',
      initials: initialsFor(title),
      title,
      subtitle: subtitleFor(user?.handle),
      badges: user?.profiles ?? [],
      to: toUserPath(user?.id),
      id: user?.id ?? '',
      profiles: user?.profiles ?? [],
    }
  }

  const profileProps = (target?: User | null): UserCard.Profile => {
    const user = target ?? resolve()

    return {
      ...cellProps(user ?? undefined),
      email: user?.email,
      bio: user?.bio,
      created_at: user?.created_at,
      updated_at: user?.updated_at,
    }
  }

  return { pillProps, cellProps, profileProps }
}
