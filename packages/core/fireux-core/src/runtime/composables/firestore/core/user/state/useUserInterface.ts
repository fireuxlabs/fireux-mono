import type { Ref } from 'vue'
import type {
  User,
  UserCard,
} from 'fireux-core/runtime/models/core/user.model.ts'
import type { UserRefs } from '../main/useUserFetch.ts'
import { useFireUXConfig } from 'fireux-core/runtime/composables/FireUXConfig.ts'

type RuntimeContext = {
  runtime?: 'global' | 'tenant'
  appId?: string | null
}

export function useUserInterface(
  source?: Ref<User | null | undefined> | UserRefs,
  context?: RuntimeContext
) {
  const resolve = (): User | null => {
    if (!source) return null
    if ('coreUser' in (source as UserRefs)) {
      return (source as UserRefs).coreUser.value ?? null
    }
    return (source as Ref<User | null | undefined>).value ?? null
  }

  const runtime = resolveRuntime(context)
  const isAdminForRuntime = createAdminResolver(runtime)
  const membershipResolver: (user: User) => UserCard.MembershipBadge[] =
    runtime.runtime === 'global' ? buildMembershipBadges : () => []

  const toUser = (target?: User | null): User | null => target ?? resolve()

  const pillProps = (target?: User | null): UserCard.Pill | null => {
    const user = toUser(target)
    if (!user) return null
    const memberships = membershipResolver(user)
    const isAdmin = isAdminForRuntime(user)

    return {
      avatar: user.avatar || '',
      initials: 'AA',
      title: user.display_name?.trim() || 'User',
      subtitle: formatHandle(user.handle),
      special: isAdmin,
      specialTooltip: isAdmin ? adminTooltip(runtime) : undefined,
      memberships,
    }
  }

  return { pillProps }
}

function resolveRuntime(input?: RuntimeContext) {
  if (input?.runtime) {
    return {
      runtime: input.runtime,
      appId: input.appId?.trim() || null,
    } as const
  }

  try {
    const cfg = useFireUXConfig()
    return {
      runtime: cfg.isTenant ? 'tenant' : 'global',
      appId: cfg.appId?.trim() || null,
    } as const
  } catch {
    return { runtime: 'global', appId: null } as const
  }
}

function formatHandle(handle?: string | null) {
  const value = handle?.trim()
  return value ? `@${value}` : ''
}

function createAdminResolver(runtime: ReturnType<typeof resolveRuntime>) {
  if (runtime.runtime === 'tenant' && runtime.appId) {
    const runtimeAppId = runtime.appId
    return (user: User) => {
      const tenantRole = user.appUser?.role?.trim().toLowerCase()
      if (tenantRole === 'admin') return true
      const adminIds = new Set(normalizeIds(user.adminOf))
      return runtimeAppId ? adminIds.has(runtimeAppId) : false
    }
  }

  return (user: User) => {
    const globalRole = user.role?.trim().toLowerCase()
    if (globalRole === 'admin') return true
    return normalizeIds(user.adminOf).length > 0
  }
}

function adminTooltip(runtime: ReturnType<typeof resolveRuntime>) {
  if (runtime.runtime === 'tenant') {
    return 'Tenant admin'
  }
  return 'Global admin'
}

function buildMembershipBadges(user: User): UserCard.MembershipBadge[] {
  const memberIds = new Set(normalizeIds(user.userOf))
  const adminIds = new Set(normalizeIds(user.adminOf))
  const union = new Set([...memberIds, ...adminIds])

  return Array.from(union)
    .filter(Boolean)
    .map((appId) => ({
      id: appId,
      label: formatAppLabel(appId),
      isAdmin: adminIds.has(appId),
    }))
    .sort((a, b) => {
      if (a.isAdmin !== b.isAdmin) {
        return a.isAdmin ? -1 : 1
      }
      return a.label.localeCompare(b.label)
    })
}

function normalizeIds(input?: string[] | null) {
  if (!Array.isArray(input)) return []
  return input
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
}

function formatAppLabel(appId: string) {
  if (!appId) return ''
  return appId
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
