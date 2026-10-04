import {
  resolveInternalRedirect,
  resolvePostAuthDestination,
} from 'fireux-core/runtime/utils/onboarding-route'

// Resume the approved hub screen only; this is navigation context, not authority.
export function resolveConnectionResume(value: unknown): string {
  const path = resolveInternalRedirect(value, '')
  if (!path) return ''
  const url = new URL(path, 'http://fireux.local')
  if (url.pathname !== '/account/continue') return ''
  const state = url.searchParams.get('state') || ''
  const challenge = url.searchParams.get('challenge') || ''
  if (!/^[A-Za-z0-9_-]{43}$/.test(state) || !/^[a-f0-9]{64}$/.test(challenge))
    return ''
  const query = new URLSearchParams({ state, challenge })
  if (url.searchParams.has('redirect'))
    query.set(
      'redirect',
      resolvePostAuthDestination(url.searchParams.get('redirect'))
    )
  return `/account/continue?${query}`
}
