// @fireux-script
// last_used: 2026-07-26
// usage_note: share hostname-only Firebase Auth domain validation across creation and additive sync.

const FIREBASE_AUTH_HOSTNAME_PATTERN =
  /^(?:localhost|(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63})$/

export function normalizeFirebaseAuthDomain(value) {
  return String(value || '').trim().toLowerCase()
}

export function assertFirebaseAuthDomain(value) {
  const domain = normalizeFirebaseAuthDomain(value)

  if (
    !domain ||
    domain.length > 253 ||
    domain.includes('://') ||
    domain.includes('/') ||
    domain.includes(':') ||
    !FIREBASE_AUTH_HOSTNAME_PATTERN.test(domain)
  ) {
    throw new Error(
      `Invalid Firebase Auth domain "${domain || String(value || '')}". ` +
      'Use a hostname without protocol, path or port.'
    )
  }

  return domain
}

export function parseFirebaseAuthDomains(value) {
  return String(value || '')
    .split(',')
    .map(domain => normalizeFirebaseAuthDomain(domain))
    .filter(Boolean)
    .map(domain => assertFirebaseAuthDomain(domain))
}
