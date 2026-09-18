const localHosts = new Set(['localhost', '127.0.0.1', '[::1]'])

/** Exact origins only: never paths, credentials, wildcard hosts or CSP expressions. */
export function normalizeAllowedWebsites(
  value: unknown,
  allowLocal = false
): string[] {
  if (!Array.isArray(value) || value.length > 20)
    throw new Error('Enter up to 20 website origins.')
  const origins = value.map((item) => {
    if (typeof item !== 'string')
      throw new Error(
        'Enter a full website origin, such as https://example.com.'
      )
    const text = item.trim()
    if (!/^https?:\/\/[^/?#\\\s]+\/?$/.test(text) || text.includes('*'))
      throw new Error(
        'Use a website origin without a page path, query, wildcard or fragment.'
      )
    let url: URL
    try {
      url = new URL(text)
    } catch {
      throw new Error('Enter a valid website origin.')
    }
    const dnsHost =
      /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)*[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i.test(
        url.hostname
      )
    const ipv6Host = /^\[[0-9a-f:]+\]$/i.test(url.hostname)
    if (!dnsHost && !ipv6Host)
      throw new Error('Enter a valid website hostname.')
    if (url.username || url.password || url.hostname.endsWith('.'))
      throw new Error(
        'Website origins cannot contain credentials or a trailing hostname dot.'
      )
    if (
      url.protocol !== 'https:' &&
      !(allowLocal && url.protocol === 'http:' && localHosts.has(url.hostname))
    )
      throw new Error(
        'Use HTTPS. Local HTTP previews are supported only in development.'
      )
    return url.origin
  })
  return [...new Set(origins)]
}

export function readAllowedWebsites(value: unknown): string[] {
  if (value == null) return []
  if (typeof value !== 'object' || Array.isArray(value))
    throw new Error('Website settings could not be read.')
  return normalizeAllowedWebsites(
    (value as Record<string, unknown>).allowed_origins,
    true
  )
}

export function websiteFrameAncestors(origins: unknown, development = false) {
  let allowed: string[] = []
  try {
    allowed = normalizeAllowedWebsites(origins, true).filter(
      (origin) => development || origin.startsWith('https:')
    )
  } catch {
    /* Invalid stored policy fails closed. */
  }
  return ["frame-ancestors 'self'", ...allowed].join(' ')
}
