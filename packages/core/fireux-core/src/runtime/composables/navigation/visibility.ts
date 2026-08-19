import type { FireUXConfig } from '../../app/composables/config/FireUXConfig'
import type { NavVisibility } from './types'

// Visibility is an app-scope display/access filter for route meta. It should
// stay about consumed surfaces, not path construction or user authorization.
type RuntimeScope = Pick<
  FireUXConfig,
  'appId' | 'role' | 'ecosystem' | 'modules' | 'domains' | 'profiles'
>

function normaliseStringList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : []
  const out = values
    .map((entry) =>
      typeof entry === 'string'
        ? entry.trim().toLowerCase()
        : String(entry ?? '')
            .trim()
            .toLowerCase()
    )
    .filter(Boolean)
  return Array.from(new Set(out))
}

export function normaliseNavVisibility(
  visibility: NavVisibility | undefined
): NavVisibility | undefined {
  if (!visibility || typeof visibility !== 'object') return undefined

  const apps = normaliseStringList(visibility.apps)
  const appRoles = normaliseStringList(visibility.appRoles)
  const ecosystems = normaliseStringList(visibility.ecosystems)
  const modules = normaliseStringList(visibility.modules)
  const modulesAny = normaliseStringList(visibility.modulesAny)
  const domains = normaliseStringList(visibility.domains)
  const domainsAny = normaliseStringList(visibility.domainsAny)
  const profiles = normaliseStringList(visibility.profiles)
  const profilesAny = normaliseStringList(visibility.profilesAny)

  if (
    !apps.length &&
    !appRoles.length &&
    !ecosystems.length &&
    !modules.length &&
    !modulesAny.length &&
    !domains.length &&
    !domainsAny.length &&
    !profiles.length &&
    !profilesAny.length
  ) {
    return undefined
  }

  return {
    ...(apps.length ? { apps } : {}),
    ...(appRoles.length ? { appRoles } : {}),
    ...(ecosystems.length ? { ecosystems } : {}),
    ...(modules.length ? { modules } : {}),
    ...(modulesAny.length ? { modulesAny } : {}),
    ...(domains.length ? { domains } : {}),
    ...(domainsAny.length ? { domainsAny } : {}),
    ...(profiles.length ? { profiles } : {}),
    ...(profilesAny.length ? { profilesAny } : {}),
  }
}

export function isNavVisibleForScope(
  visibility: NavVisibility | undefined,
  scope: RuntimeScope
): boolean {
  const rule = normaliseNavVisibility(visibility)
  if (!rule) return true

  const appId = (scope.appId || '').trim().toLowerCase()
  const role = (scope.role || '').trim().toLowerCase()
  const ecosystem = (scope.ecosystem || '').trim().toLowerCase()
  const modules = new Set(normaliseStringList(scope.modules))
  const domains = new Set(normaliseStringList(scope.domains))
  const profiles = new Set(normaliseStringList(scope.profiles))

  if (rule.apps?.length && !rule.apps.includes(appId)) return false
  if (rule.appRoles?.length && !rule.appRoles.includes(role)) return false
  if (rule.ecosystems?.length && !rule.ecosystems.includes(ecosystem))
    return false
  if (
    rule.modules?.length &&
    !rule.modules.every((name) => modules.has(name))
  ) {
    return false
  }
  if (
    rule.modulesAny?.length &&
    !rule.modulesAny.some((name) => modules.has(name))
  ) {
    return false
  }
  if (
    rule.domains?.length &&
    !rule.domains.every((name) => domains.has(name))
  ) {
    return false
  }
  if (
    rule.domainsAny?.length &&
    !rule.domainsAny.some((name) => domains.has(name))
  ) {
    return false
  }
  if (
    rule.profiles?.length &&
    !rule.profiles.every((name) => profiles.has(name))
  ) {
    return false
  }
  if (
    rule.profilesAny?.length &&
    !rule.profilesAny.some((name) => profiles.has(name))
  ) {
    return false
  }

  return true
}
