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

  const pillProps = (target?: User | null): UserCard.Pill => {
    const user = target ?? resolve()
    return {
      avatar: user?.avatar ?? '',
      title: user?.display_name ?? '',
      subtitle: subtitle(user?.handle),
      badges: user?.profiles ?? [],
      to: (toPath(user?.id) || null) as RouteLocationRaw,
    }
  }

  const cellProps = (target?: User | null): UserCard.Cell => {
    const user = target ?? resolve()
    const base = pillProps(user)

    return {
      ...base,
      to: toPath(user?.id),
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
