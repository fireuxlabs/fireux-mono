// Concurrent edit — 2026-07-21 16:06 CEST — Misebox dev stability pass: bound logo probes and keep expected misses quiet.
import { defineEventHandler, getQuery } from 'h3'

const debug = process.env.FIREUX_PLACES_DEBUG === 'true'
const log = (...args: unknown[]) => {
  if (debug) console.info('[places-logo]', ...args)
}
const logWarn = (...args: unknown[]) => {
  if (debug) console.warn('[places-logo]', ...args)
}
const logError = (...args: unknown[]) => console.error('[places-logo]', ...args)

const HOMEPAGE_TIMEOUT_MS = 4500
const PROBE_TIMEOUT_MS = 2500
const PROBE_TOTAL_TIMEOUT_MS = 5000
const PROBE_CONCURRENCY = 4
const MAX_CANDIDATES = 20
const NON_BRAND_ASSET_PATTERNS: Array<{ reason: string; pattern: RegExp }> = [
  { reason: 'tripadvisor widget', pattern: /tripadvisor/i },
  { reason: 'review widget', pattern: /wp[-_/]tripadvisor[-_/]review[-_/]slider/i },
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
  { reason: 'google asset', pattern: /google[-_/](maps|review|rating|icon)|maps\.gstatic\.com/i },
  { reason: 'yelp asset', pattern: /\byelp\b/i },
  { reason: 'foursquare asset', pattern: /\bfoursquare\b/i },
  { reason: 'trustpilot asset', pattern: /\btrustpilot\b/i },
]

type LogoSource = 'homepage-icon' | 'inline-logo' | 'common-path' | 'social-logo'
type EmptyReason = 'missing-site' | 'fetch-failed' | 'not-found'

type LogoCandidate = {
  url: string
  source: LogoSource
}

type LogoResponse = {
  url: string | null
  source: LogoSource | null
  reason?: EmptyReason
}

const emptyLogo = (reason: EmptyReason): LogoResponse => ({
  url: null,
  source: null,
  reason,
})

/**
 * Best-effort logo discovery.
 *
 * This endpoint only returns URLs discovered from the place's own website/domain.
 * It never invents a logo through avatar services, Google favicons, placeholders,
 * or name-only guesses.
 */
export default defineEventHandler(async (event): Promise<LogoResponse> => {
  const q = getQuery(event)
  const websiteParam = (q.website as string | undefined)?.trim()
  const domainParam = (q.domain as string | undefined)?.trim()

  log('incoming request', {
    website: websiteParam,
    domain: domainParam,
  })

  const baseUrl = resolveBaseUrl(websiteParam, domainParam)
  if (!baseUrl) {
    logWarn('no website or domain provided')
    return emptyLogo('missing-site')
  }

  log('resolved base url', { baseUrl })

  try {
    const htmlRes = await fetchHomepage(baseUrl)
    if (!htmlRes?.ok) {
      logWarn('homepage fetch failed', {
        baseUrl,
        status: htmlRes?.status ?? null,
      })
      return emptyLogo('fetch-failed')
    }

    const html = await htmlRes.text()
    const finalHome = htmlRes.url || baseUrl
    const candidates = buildCandidates(html, finalHome)

    log('candidate counts', {
      homepageIcon: candidates.filter((x) => x.source === 'homepage-icon').length,
      inlineLogo: candidates.filter((x) => x.source === 'inline-logo').length,
      commonPath: candidates.filter((x) => x.source === 'common-path').length,
      socialLogo: candidates.filter((x) => x.source === 'social-logo').length,
      total: candidates.length,
    })

    const scored = await probeCandidates(candidates)
    if (!scored.length) return emptyLogo('not-found')

    scored.sort((a, b) => b.score - a.score)
    const winner = scored[0]
    log('selected candidate', winner)
    return { url: winner.url, source: winner.source }
  } catch (error) {
    logError('unexpected error during resolution', error)
    return emptyLogo('fetch-failed')
  }
})

async function fetchHomepage(baseUrl: string): Promise<Response | null> {
  const homepageController = new AbortController()
  const homepageTimeout = setTimeout(() => {
    if (!homepageController.signal.aborted) {
      homepageController.abort()
    }
  }, HOMEPAGE_TIMEOUT_MS)

  try {
    return await fetch(baseUrl, {
      redirect: 'follow',
      signal: homepageController.signal,
      headers: {
        'user-agent': 'FireUX-LogoFetcher/1.0',
        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })
  } catch (error) {
    logWarn('homepage request failed', {
      baseUrl,
      aborted: isAbortError(error),
      error: isAbortError(error) ? undefined : error,
    })
    return null
  } finally {
    clearTimeout(homepageTimeout)
  }
}

function buildCandidates(html: string, finalHome: string): LogoCandidate[] {
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

function resolveBaseUrl(website?: string, domain?: string): string | null {
  if (website) return normalizeSiteUrl(website)
  if (domain) return normalizeSiteUrl(domain)
  return null
}

function normalizeSiteUrl(value: string): string | null {
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

function toAbsolute(base: string, maybe: string): string {
  try {
    return new URL(maybe, base).toString()
  } catch {
    return maybe
  }
}

function getAttr(tag: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]+)"|'([^']+)'|([^\\s>]+))`, 'i')
  const m = re.exec(tag)
  if (!m) return null
  return (m[2] || m[3] || m[4] || '').trim()
}

function extractIconLinks(html: string): string[] {
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

function extractSocialImages(html: string): string[] {
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

function extractInlineLogoImages(html: string): string[] {
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

function isStrongLogoUrl(url: string): boolean {
  return /logo|brand|wordmark|logomark/i.test(url)
}

function getNonBrandAssetReason(value: string): string | null {
  for (const { reason, pattern } of NON_BRAND_ASSET_PATTERNS) {
    if (pattern.test(value)) return reason
  }
  return null
}

function filterBrandCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
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

function filterSameSiteCandidates(
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

function isSameSite(finalHome: string, candidateUrl: string): boolean {
  try {
    const baseHost = normalizeHost(new URL(finalHome).hostname)
    const candidateHost = normalizeHost(new URL(candidateUrl).hostname)
    return (
      candidateHost === baseHost || candidateHost.endsWith(`.${baseHost}`)
    )
  } catch {
    return false
  }
}

function normalizeHost(value: string) {
  return value.toLowerCase().replace(/^www\./, '')
}

function dedupeCandidates(candidates: LogoCandidate[]): LogoCandidate[] {
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

async function looksLikeImage(
  url: string,
  totalSignal: AbortSignal
): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { accept: 'image/*' },
      signal: AbortSignal.any([
        totalSignal,
        AbortSignal.timeout(PROBE_TIMEOUT_MS),
      ]),
    })
    if (head.ok) {
      const ct = (head.headers.get('content-type') || '').toLowerCase()
      return isImageContentType(ct)
    }
  } catch {
    // Some servers reject HEAD, so try GET before giving up.
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { accept: 'image/*' },
      signal: AbortSignal.any([
        totalSignal,
        AbortSignal.timeout(PROBE_TIMEOUT_MS),
      ]),
    })
    if (!res.ok) {
      await res.body?.cancel()
      return false
    }
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    await res.body?.cancel()
    return isImageContentType(ct)
  } catch {
    return false
  }
}

function isImageContentType(ct: string): boolean {
  return ct.startsWith('image/') || ct.includes('svg') || ct.includes('xml')
}

function scoreCandidate(candidate: LogoCandidate): number {
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

async function probeCandidates(
  candidates: LogoCandidate[]
): Promise<Array<LogoCandidate & { score: number }>> {
  const results: Array<LogoCandidate & { score: number }> = []
  const queue = [...candidates]
  const totalSignal = AbortSignal.timeout(PROBE_TOTAL_TIMEOUT_MS)
  const workers = Array.from(
    { length: Math.min(PROBE_CONCURRENCY, queue.length || 1) },
    () => worker()
  )
  await Promise.all(workers)
  return results

  async function worker() {
    while (queue.length) {
      const candidate = queue.shift()
      if (!candidate) return
      const ok = await looksLikeImage(candidate.url, totalSignal)
      if (!ok) continue
      const score = scoreCandidate(candidate)
      log('candidate ok', { ...candidate, score })
      results.push({ ...candidate, score })
    }
  }
}

function isAbortError(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'name' in error &&
    String((error as { name?: unknown }).name) === 'AbortError'
  )
}
