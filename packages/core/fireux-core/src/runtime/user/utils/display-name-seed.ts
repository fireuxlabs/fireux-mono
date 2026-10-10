type DisplayNameSeed = {
  displayName?: string | null
  email?: string | null
  uid?: string | null
  isAnonymous?: boolean
}

const looksLikeEmail = (value: string) => /^[^\s@]+@[^\s@]+$/.test(value)

/** Derive initial public identity from Auth hints without publishing an email address. */
export function userDisplayNameSeed(input: DisplayNameSeed): string {
  const primary = String(input.displayName ?? '').trim()
  if (primary)
    return looksLikeEmail(primary)
      ? primary.split('@')[0]?.trim() || ''
      : primary
  const fallback = String(input.email ?? '').trim()
  if (fallback)
    return looksLikeEmail(fallback)
      ? fallback.split('@')[0]?.trim() || ''
      : fallback
  const suffix = String(input.uid ?? '')
    .trim()
    .slice(0, 6)
  return input.isAnonymous && suffix ? `Guest ${suffix}` : ''
}
