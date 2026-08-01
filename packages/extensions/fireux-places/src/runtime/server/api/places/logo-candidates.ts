import { log } from './logo-logging'
import { MAX_CANDIDATES } from './logo-settings'

export const NON_BRAND_ASSET_PATTERNS: Array<{
  reason: string
  pattern: RegExp
}> = [
  { reason: 'tripadvisor widget', pattern: /tripadvisor/i },
  {
    reason: 'review widget',
    pattern: /wp[-_/]tripadvisor[-_/]review[-_/]slider/i,
  },
  {
    reason: 'review widget asset',
    pattern: /\breview(s)?[-_/]?(badge|button|icon|logo|rating|star|widget)\b/i,
  },
  {
    reason: 'rating widget asset',
    pattern: /\brating(s)?[-_/]?(badge|button|icon|logo|star|widget)\b/i,
  },
  {
    reason: 'star rating asset',
    pattern: /\bstar(s)?[-_/]?(badge|button|icon|rating|widget)\b/i,
  },
  { reason: 'facebook asset', pattern: /facebook|fb[-_/]icon/i },
  {
    reason: 'google asset',
    pattern: /google[-_/](maps|review|rating|icon)|maps\.gstatic\.com/i,
  },
  { reason: 'yelp asset', pattern: /\byelp\b/i },
  { reason: 'foursquare asset', pattern: /\bfoursquare\b/i },
  { reason: 'trustpilot asset', pattern: /\btrustpilot\b/i },
]

export type LogoSource =
  | 'homepage-icon'
  | 'inline-logo'
  | 'common-path'
  | 'social-logo'

export type EmptyReason = 'missing-site' | 'fetch-failed' | 'not-found'

export type LogoCandidate = {
  url: string
  source: LogoSource
}

export type LogoResponse = {
  url: string | null
  source: LogoSource | null
  reason?: EmptyReason
}

export const emptyLogo = (reason: EmptyReason): LogoResponse => ({
  url: null,
  source: null,
  reason,
})

export function buildCandidates(
  html: string,
  finalHome: string
): LogoCandidate[] {
  const makeAbs = (url: string) => toAbsolute(finalHome, url)
  const iconCandidates = extractIconLinks(html).map((url) => ({
    url: makeAbs(url),
    source: 'homepage-icon' as const,
  }))
  const inlineCandidates = extractInlineLogoImages(html).map((url) => ({
    url: makeAbs(url),
    source: 'inline-logo' as const,
  }))
  const commonCandidates = [
    '/logo.svg',
    '/logo.png',
    '/logo.webp',
    '/assets/logo.svg',
    '/assets/logo.png',
    '/img/logo.svg',
    '/img/logo.png',
    '/images/logo.svg',
    '/images/logo.png',
    '/static/logo.svg',
    '/static/logo.png',
  ].map((path) => ({
    url: new URL(path, finalHome).toString(),
    source: 'common-path' as const,
  }))
  const socialCandidates = extractSocialImages(html)
    .map(makeAbs)
    .filter(isStrongLogoUrl)
    .map((url) => ({
      url,
      source: 'social-logo' as const,
    }))

  return dedupeCandidates(
    filterSameSiteCandidates(
      finalHome,
      filterBrandCandidates([
        ...iconCandidates,
        ...inlineCandidates,
        ...commonCandidates,
        ...socialCandidates,
      ])
    )
  ).slice(0, MAX_CANDIDATES)
}

export function resolveBaseUrl(
  website?: string,
  domain?: string
): string | null {
  if (website) return normalizeSiteUrl(website)
  if (domain) return normalizeSiteUrl(domain)
  return null
}

export function normalizeSiteUrl(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`
  try {
    return new URL(withProtocol).toString()
  } catch {
    return null
  }
}

export function toAbsolute(base: string, maybe: string): string {
  try {
    return new URL(maybe, base).toString()
  } catch {
    return maybe
  }
}

export function getAttr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]+)"|'([^']+)'|([^\\s>]+))`, 'i')
  const m = re.exec(tag)
  if (!m) return null
  return (m[2] || m[3] || m[4] || '').trim()
}

export function extractIconLinks(html: string): string[] {
  const links = html.match(/<link\b[^>]*>/gi) || []
  const out: string[] = []
  for (const link of links) {
    const rel = getAttr(link, 'rel')?.toLowerCase() || ''
    if (
      rel.includes('icon') ||
      rel.includes('shortcut icon') ||
      rel.includes('mask-icon') ||
      rel.includes('apple-touch-icon')
    ) {
      const href = getAttr(link, 'href')
      if (href) out.push(href)
    }
  }
  return out
}

export function extractSocialImages(html: string): string[] {
  const metas = html.match(/<meta\b[^>]*>/gi) || []
  const out: string[] = []
  for (const meta of metas) {
    const prop = getAttr(meta, 'property')?.toLowerCase()
    const name = getAttr(meta, 'name')?.toLowerCase()
    if (prop === 'og:image' || name === 'twitter:image') {
      const content = getAttr(meta, 'content')
      if (content) out.push(content)
    }
  }
  return out
}

export function extractInlineLogoImages(html: string): string[] {
  const imgs = html.match(/<img\b[^>]*>/gi) || []
  const out: string[] = []
  for (const img of imgs) {
    const src = getAttr(img, 'src')
    if (!src) continue
    const signature = [
      getAttr(img, 'alt'),
      getAttr(img, 'class'),
      getAttr(img, 'id'),
      src,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const rejectionReason = getNonBrandAssetReason(signature)
    if (rejectionReason) {
      log('rejected inline image signature', {
        reason: rejectionReason,
        src,
      })
      continue
    }
    if (/logo|brand|mark/.test(signature)) {
      out.push(src)
    }
  }
  return out
}

export function isStrongLogoUrl(url: string): boolean {
  return /logo|brand|wordmark|logomark/i.test(url)
}

export function getNonBrandAssetReason(value: string): string | null {
  for (const { reason, pattern } of NON_BRAND_ASSET_PATTERNS) {
    if (pattern.test(value)) return reason
  }
  return null
}

export function filterBrandCandidates(
  candidates: LogoCandidate[]
): LogoCandidate[] {
  const out: LogoCandidate[] = []
  for (const candidate of candidates) {
    const rejectionReason = getNonBrandAssetReason(candidate.url)
    if (rejectionReason) {
      log('rejected non-brand candidate', {
        source: candidate.source,
        reason: rejectionReason,
        url: candidate.url,
      })
      continue
    }
    out.push(candidate)
  }
  return out
}

export function filterSameSiteCandidates(
  finalHome: string,
  candidates: LogoCandidate[]
): LogoCandidate[] {
  const out: LogoCandidate[] = []
  for (const candidate of candidates) {
    if (isSameSite(finalHome, candidate.url)) {
      out.push(candidate)
      continue
    }
    log('rejected off-site candidate', {
      source: candidate.source,
      url: candidate.url,
    })
  }
  return out
}

export function isSameSite(finalHome: string, candidateUrl: string): boolean {
  try {
    const baseHost = normalizeHost(new URL(finalHome).hostname)
    const candidateHost = normalizeHost(new URL(candidateUrl).hostname)
    return candidateHost === baseHost || candidateHost.endsWith(`.${baseHost}`)
  } catch {
    return false
  }
}

export function normalizeHost(value: string) {
  return value.toLowerCase().replace(/^www\./, '')
}

export function dedupeCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
  const seen = new Set<string>()
  const out: LogoCandidate[] = []
  for (const candidate of candidates) {
    const key = candidate.url.trim()
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push({ ...candidate, url: key })
  }
  return out
}

export function scoreCandidate(candidate: LogoCandidate): number {
  let score = 0
  const url = candidate.url.toLowerCase()

  if (url.endsWith('.svg')) score += 100
  else if (url.endsWith('.png') || url.endsWith('.webp')) score += 90
  else if (url.endsWith('.ico')) score += 80
  else score += 70

  if (candidate.source === 'inline-logo') score += 20
  if (candidate.source === 'common-path') score += 15
  if (candidate.source === 'homepage-icon') score += 10
  if (candidate.source === 'social-logo') score += 5

  if (url.includes('logo')) score += 15
  if (url.includes('apple-touch-icon')) score += 10
  if (url.includes('favicon')) score += 5

  if (url.includes('32x32') || url.includes('16x16')) score -= 15
  if (url.includes('192x192') || url.includes('512x512')) score += 5

  return score
}
