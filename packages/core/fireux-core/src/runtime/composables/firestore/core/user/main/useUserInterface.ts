// FILE: ~/composables/user/useUserInterface.ts
import type { Ref } from 'vue'
import type {
  User,
  UserToPillMapper,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from 'fireux-core/runtime/composables/firestore/core/user/main/useUserFetch.ts'
import type { Pill } from 'fireux-core/runtime/types/pill.model.ts'

type MaybeUser = Pick<User, 'id' | 'display_name' | 'avatar' | 'handle'> & {
  profiles?: string[] | null
}

const toMaybeUser = (candidate?: MaybeUser | null): MaybeUser | null => {
  if (!candidate) return null
  return {
    id: candidate.id ?? '',
    display_name: candidate.display_name ?? '',
    avatar: candidate.avatar ?? '',
    handle: candidate.handle ?? '',
    profiles: Array.isArray(candidate.profiles)
      ? candidate.profiles
      : undefined,
  }
}

const initialsFromName = (name: string): string => {
  const normalized = name.trim()
  if (!normalized) return 'A'
  const parts = normalized.split(/\s+/).filter(Boolean).slice(0, 2)
  if (!parts.length) return 'A'
  const initials = parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
  return initials || 'A'
}

export function useUserInterface(
  source?: Ref<User | null | undefined> | UserRefs
) {
  const resolveCore = (): MaybeUser | null => {
    if (!source) return null
    const grouped = source as UserRefs
    if (grouped.coreUser) {
      return toMaybeUser(grouped.coreUser.value as MaybeUser | null)
    }

    const ref = source as Ref<User | null | undefined>
    return toMaybeUser(ref?.value ?? null)
  }

  const pickActive = (target?: User | null | undefined): MaybeUser | null =>
    target ? toMaybeUser(target) : resolveCore()

  const initialsFor = (target?: Pick<User, 'display_name'> | null) =>
    initialsFromName(
      String(target?.display_name ?? resolveCore()?.display_name ?? '')
    )

  const buildPill = (input?: MaybeUser | null) => {
    const active = input ?? resolveCore()
    const title = active?.display_name ?? ''
    const subtitle = active?.handle ? `@${active.handle}` : ''
    const badges = active?.profiles ?? []
    const avatar = active?.avatar ?? ''
    const to = active?.id ? `/users/${active.id}` : ''

    return {
      avatar,
      initials: initialsFor(active ?? undefined),
      title,
      subtitle,
      badges,
      to,
    }
  }

  const toPill = (): Pill.Props => {
    const base = buildPill()
    return {
      avatar: base.avatar,
      initials: base.initials,
      title: base.title,
      subtitle: base.subtitle,
      badges: base.badges,
      to: base.to,
    }
  }

  const pillProps: UserToPillMapper = (user: User) =>
    buildPill(pickActive(user))

  return { toPill, pillProps, initialsFor }
}
