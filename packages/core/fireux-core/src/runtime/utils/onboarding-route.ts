const DEFAULT_ONBOARDING_DESTINATION = '/dashboard'

export function resolveInternalRedirect(
  value: unknown,
  fallback = DEFAULT_ONBOARDING_DESTINATION
): string {
  const raw = Array.isArray(value) ? value[0] : value
  if (typeof raw !== 'string') return fallback

  const target = raw.trim()
  if (
    !target.startsWith('/') ||
    target.startsWith('//') ||
    target.includes('\\')
  ) {
    return fallback
  }
  return target
}

export function resolveUserOnboardingDestination(value: unknown): string {
  let target = resolveInternalRedirect(value)
  const seen = new Set<string>()

  while (!seen.has(target)) {
    seen.add(target)
    const url = new URL(target, 'http://fireux.local')
    if (
      url.pathname !== '/users/create' &&
      url.pathname !== '/dashboard/user/create'
    ) {
      return target
    }
    target = resolveInternalRedirect(url.searchParams.get('redirect'))
  }

  return DEFAULT_ONBOARDING_DESTINATION
}

export function userOnboardingPath(value: unknown): string {
  const destination = resolveUserOnboardingDestination(value)
  return `/users/create?redirect=${encodeURIComponent(destination)}`
}
