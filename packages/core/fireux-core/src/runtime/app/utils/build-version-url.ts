export function withBuildVersion(url: string, buildId: unknown): string {
  const version = typeof buildId === 'string' ? buildId.trim() : ''
  if (!version) return url

  const hashIndex = url.indexOf('#')
  const base = hashIndex === -1 ? url : url.slice(0, hashIndex)
  const hash = hashIndex === -1 ? '' : url.slice(hashIndex)
  const joiner = base.includes('?')
    ? base.endsWith('?') || base.endsWith('&')
      ? ''
      : '&'
    : '?'

  const query = new URLSearchParams({ v: version }).toString()
  return `${base}${joiner}${query}${hash}`
}
