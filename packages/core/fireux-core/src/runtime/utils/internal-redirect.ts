export function resolveInternalRedirect(
  value: unknown,
  fallback = '/dashboard'
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
  try {
    if (
      new URL(target, 'http://fireux.local').origin !== 'http://fireux.local'
    ) {
      return fallback
    }
  } catch {
    return fallback
  }
  return target
}
