import type { Ref } from 'vue'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../main/useUserFetch.ts'

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

  const toUser = (target?: User | null): User | null => target ?? resolve()

  const shapeShared = (user: User) => {
    const name = user.display_name?.trim() || '-'
    const handle = user.handle?.trim() || '-'
    const badges = Array.isArray(user.profiles)
      ? user.profiles
          .map((value) => (typeof value === 'string' ? value.trim() : ''))
          .filter(Boolean)
      : []
    const role = (user.appUser?.role ?? user.role)?.trim().toLowerCase()
    const isAdmin = role === 'admin'
    const memberships = formatMemberships(user)

    return {
      avatar: user.avatar || '',
      initials: name[0],
      title: name,
      subtitle: `@${handle}`,
      badges,
      to: user.id ? `/users/${user.id}` : null,
      special: isAdmin,
      specialTooltip: isAdmin ? 'Tenant admin' : undefined,
      role: role ?? '-',
      id: user.id ?? '-',
      memberships,
    }
  }

  const pillProps = (target?: User | null): UserCard.Pill | null => {
    const user = toUser(target)
    if (!user) return null
    const shared = shapeShared(user)
    return {
      avatar: shared.avatar,
      initials: shared.initials,
      title: shared.title,
      subtitle: shared.subtitle,
      badges: shared.badges,
      to: shared.to,
      special: shared.special,
      specialTooltip: shared.specialTooltip,
      memberships: shared.memberships,
    }
  }

  const cellProps = (target?: User | null): UserCard.Cell | null => {
    const user = toUser(target)
    if (!user) return null
    const shared = shapeShared(user)
    return {
      avatar: shared.avatar,
      initials: shared.initials,
      title: shared.title,
      subtitle: shared.subtitle,
      badges: shared.badges,
      to: shared.to,
      special: shared.special,
      specialTooltip: shared.specialTooltip,
      id: shared.id,
      profiles: shared.badges,
      role: shared.role,
      memberships: shared.memberships,
    }
  }

  const formatMemberships = (user: User): UserCard.MembershipBadge[] => {
    const apps = Array.isArray(user.userOf) ? user.userOf : []
    if (!apps.length) return []

    const adminApps = new Set(
      Array.isArray(user.adminOf) ? user.adminOf.filter(Boolean) : []
    )

    return apps
      .map((app) => (typeof app === 'string' ? app.trim() : ''))
      .filter((app): app is string => Boolean(app))
      .map((app) => ({
        id: app,
        label: humanizeAppId(app),
        isAdmin: adminApps.has(app),
      }))
  }

  const humanizeAppId = (value: string): string =>
    value
      .split(/[-_]/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(' ')

  return { pillProps, cellProps }
}
