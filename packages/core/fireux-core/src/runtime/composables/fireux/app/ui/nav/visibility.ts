import type { FireUXConfig } from '../../FireUXConfig'
import type { NavVisibility } from '../../nav.types'

type RuntimeScope = Pick<
  FireUXConfig,
  | 'appId'
  | 'ecosystem'
  | 'modules'
  | 'profiles'
  | 'dashboardPages'
>

function normaliseStringList(value: unknown): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : []
  const out = values
    .map((entry) =>
      typeof entry === 'string'
        ? entry.trim().toLowerCase()
        : String(entry ?? '').trim().toLowerCase()
    )
    .filter(Boolean)
  return Array.from(new Set(out))
}

export function normaliseNavVisibility(
  visibility: NavVisibility | undefined
): NavVisibility | undefined {
  if (!visibility || typeof visibility !== 'object') return undefined

  const apps = normaliseStringList(visibility.apps)
  const ecosystems = normaliseStringList(visibility.ecosystems)
  const modules = normaliseStringList(visibility.modules)
  const modulesAny = normaliseStringList(visibility.modulesAny)
  const profiles = normaliseStringList(visibility.profiles)
  const profilesAny = normaliseStringList(visibility.profilesAny)
  const dashboardPages = normaliseStringList(visibility.dashboardPages)
  const dashboardPagesAny = normaliseStringList(visibility.dashboardPagesAny)

  if (
    !apps.length &&
    !ecosystems.length &&
    !modules.length &&
    !modulesAny.length &&
    !profiles.length &&
    !profilesAny.length &&
    !dashboardPages.length &&
    !dashboardPagesAny.length
  ) {
    return undefined
  }

  return {
    ...(apps.length ? { apps } : {}),
    ...(ecosystems.length ? { ecosystems } : {}),
    ...(modules.length ? { modules } : {}),
    ...(modulesAny.length ? { modulesAny } : {}),
    ...(profiles.length ? { profiles } : {}),
    ...(profilesAny.length ? { profilesAny } : {}),
    ...(dashboardPages.length ? { dashboardPages } : {}),
    ...(dashboardPagesAny.length ? { dashboardPagesAny } : {}),
  }
}

export function isNavVisibleForScope(
  visibility: NavVisibility | undefined,
  scope: RuntimeScope
): boolean {
  const rule = normaliseNavVisibility(visibility)
  if (!rule) return true

  const appId = (scope.appId || '').trim().toLowerCase()
  const ecosystem = (scope.ecosystem || '').trim().toLowerCase()
  const modules = new Set(normaliseStringList(scope.modules))
  const profiles = new Set(normaliseStringList(scope.profiles))
  const dashboardPages = new Set(normaliseStringList(scope.dashboardPages))

  if (rule.apps?.length && !rule.apps.includes(appId)) return false
  if (rule.ecosystems?.length && !rule.ecosystems.includes(ecosystem)) return false
  if (rule.modules?.length && !rule.modules.every((name) => modules.has(name))) {
    return false
  }
  if (rule.modulesAny?.length && !rule.modulesAny.some((name) => modules.has(name))) {
    return false
  }
  if (rule.profiles?.length && !rule.profiles.every((name) => profiles.has(name))) {
    return false
  }
  if (rule.profilesAny?.length && !rule.profilesAny.some((name) => profiles.has(name))) {
    return false
  }
  if (
    rule.dashboardPages?.length &&
    !rule.dashboardPages.every((name) => dashboardPages.has(name))
  ) {
    return false
  }
  if (
    rule.dashboardPagesAny?.length &&
    !rule.dashboardPagesAny.some((name) => dashboardPages.has(name))
  ) {
    return false
  }

  return true
}
