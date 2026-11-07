import { resolveInternalRedirect } from '../../utils/internal-redirect.ts'

const DEFAULT_ONBOARDING_DESTINATION = '/dashboard'

export function resolveUserOnboardingDestination(value: unknown): string {
  let target = resolveInternalRedirect(value)
  const seen = new Set<string>()

  while (!seen.has(target)) {
    seen.add(target)
    const url = new URL(target, 'http://fireux.local')
    if (url.pathname !== '/users/create') return target
    target = resolveInternalRedirect(url.searchParams.get('redirect'))
  }

  return DEFAULT_ONBOARDING_DESTINATION
}

export function userOnboardingPath(value: unknown): string {
  const destination = resolveUserOnboardingDestination(value)
  return `/users/create?redirect=${encodeURIComponent(destination)}`
}

export function resolvePostAuthDestination(value: unknown): string {
  const target = resolveUserOnboardingDestination(value)
  const url = new URL(target, 'http://fireux.local')
  return url.pathname.replace(/\/+$/, '') === '/auth'
    ? DEFAULT_ONBOARDING_DESTINATION
    : target
}

/** One safe sign-in URL for navigation guards and live session redirects. */
export function authRedirectPath(value: unknown): string {
  return `/auth?redirect=${encodeURIComponent(resolvePostAuthDestination(value))}`
}
