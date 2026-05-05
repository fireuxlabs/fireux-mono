import { defineEventHandler, getQuery } from 'h3'

const log = (...args: unknown[]) => console.info('[places-logo]', ...args)
const logWarn = (...args: unknown[]) => console.warn('[places-logo]', ...args)
const logError = (...args: unknown[]) => console.error('[places-logo]', ...args)

const HOMEPAGE_TIMEOUT_MS = 4500
const PROBE_CONCURRENCY = 4
const CLEARBIT_SIZE = 256
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

/**
 * Best-effort logo resolver.
 * Priority:
 *   1) <link rel="icon" ...> on homepage (SVG/PNG preferred)
 *   2) Common logo paths (/logo.svg|png|webp, /images/logo.*, etc.)
 *   3) Social meta images (og:image, twitter:image)
 *   4) Unavatar (site avatar) → Google S2 favicon
 *   5) Picsum placeholder
 *
 * Pass the business website or domain if possible:
 *   /api/places/logo?website=https://yellow-velo.ch
 *   /api/places/logo?domain=yellow-velo.ch
 * Fallback (name only) will still return a placeholder chain.
 */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const websiteParam = (q.website as string | undefined)?.trim()
  const domainParam = (q.domain as string | undefined)?.trim()
  const nameParam = (q.q as string | undefined)?.trim() // optional, for placeholder seed

  log('incoming request', {
    website: websiteParam,
    domain: domainParam,
    nameSeed: nameParam,
  })

  // Resolve a base URL to crawl (homepage). Prefer website → domain.
  const baseUrl = resolveBaseUrl(websiteParam, domainParam)
  if (!baseUrl) {
    // No site info: jump directly to avatar fallbacks & placeholder.
    logWarn('no base url resolved, jumping to fallbacks')
    const url = await fallbackChain('', nameParam)
    log('fallback result (no base)', { url })
    return { url }
  }

  log('resolved base url', { baseUrl })

  try {
    // 1) Fetch homepage HTML (GET, follow redirects).
    const homepageController = new AbortController()
    const homepageTimeout = setTimeout(() => {
      if (!homepageController.signal.aborted) {
        homepageController.abort()
      }
    }, HOMEPAGE_TIMEOUT_MS)

    let htmlRes: Response | null = null
    let homepageError: unknown = null
    try {
      htmlRes = await fetch(baseUrl, {
        redirect: 'follow',
        signal: homepageController.signal,
        headers: {
          'user-agent': 'FireUX-LogoFetcher/1.0',
          accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      })
    } catch (error) {
      homepageError = error
    } finally {
      clearTimeout(homepageTimeout)
    }
    if (!htmlRes?.ok) {
      const status = htmlRes?.status ?? null
      const aborted = homepageError && isAbortError(homepageError)
      logWarn('homepage fetch failed', {
        baseUrl,
        status,
        aborted,
        error: aborted ? undefined : homepageError,
      })
      const url = await fallbackChain(baseUrl, nameParam)
      log('fallback result (fetch not ok)', { url })
      return { url }
    }
    const html = await htmlRes.text()

    // Prepare an absolute URL helper using the *final* URL (after redirects).
    const finalHome = htmlRes.url || baseUrl
    log('fetched homepage html', { finalHome })
    const makeAbs = (u: string) => toAbsolute(finalHome, u)

    // 2) Collect icon link candidates.
    const iconLinks = filterBrandCandidateUrls(
      extractIconLinks(html).map(makeAbs),
      'icon links'
    )

    // 3) Collect social meta images (only keep if they look like logos).
    const socialImgsRaw = filterBrandCandidateUrls(
      extractSocialImages(html).map(makeAbs),
      'social images'
    )
    const socialImgs = socialImgsRaw.filter((url) =>
      /logo|icon|brand|mark/i.test(url)
    )

    // 4) Collect inline <img> logos (class/id/alt contains logo/brand/mark).
    const inlineImgs = filterBrandCandidateUrls(
      extractInlineLogoImages(html).map(makeAbs),
      'inline images'
    )

    // 5) Common logo paths (HEAD probe first).
    const commonPaths = [
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
    ].map((p) => new URL(p, finalHome).toString())

    // 6) Validate candidates with lightweight HEAD/GET and score.
    const allCandidates = dedupe([
      ...iconLinks,
      ...inlineImgs,
      ...commonPaths,
      ...socialImgs,
    ])

    log('candidate counts', {
      iconLinks: iconLinks.length,
      inlineImgs: inlineImgs.length,
      commonPaths: commonPaths.length,
      socialImgs: socialImgs.length,
      socialImgsRaw: socialImgsRaw.length,
      total: allCandidates.length,
    })

    let scored = await probeCandidates(allCandidates)

    if (!scored.length && socialImgsRaw.length) {
      const fallbackCandidates = dedupe([
        ...iconLinks,
        ...inlineImgs,
        ...commonPaths,
        ...socialImgsRaw,
      ])
      log('fallback to social images', {
        total: fallbackCandidates.length,
      })
      scored = await probeCandidates(fallbackCandidates)
    }

    // 6) Pick best or fallback chain.
    if (scored.length) {
      scored.sort((a, b) => b.score - a.score)
      const winner = scored[0]
      log('selected candidate', winner)
      return { url: winner.url }
    }

    const url = await fallbackChain(finalHome, nameParam)
    log('fallback result (no candidates)', { url })
    return { url }
  } catch (error) {
    logError('unexpected error during resolution', error)
    const url = await fallbackChain(baseUrl, nameParam)
    log('fallback result (error)', { url })
    return { url }
  }
})

/* ───────────────── helpers ───────────────── */

function resolveBaseUrl(website?: string, domain?: string): string | null {
  if (website) {
    try {
      const u = new URL(website)
      if (!u.protocol) return `https://${website}`
      return u.toString()
    } catch {
      return `https://${website}`
    }
  }
  if (domain) {
    try {
      const u = new URL(`https://${domain}`)
      return u.toString()
    } catch {
      return null
    }
  }
  return null
}

function toAbsolute(base: string, maybe: string): string {
  try {
    const u = new URL(maybe, base)
    return u.toString()
  } catch {
    return maybe
  }
}

// Naive attribute parsing (good enough for link/meta scanning without a DOM lib)
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

function getNonBrandAssetReason(value: string): string | null {
  for (const { reason, pattern } of NON_BRAND_ASSET_PATTERNS) {
    if (pattern.test(value)) return reason
  }
  return null
}

function filterBrandCandidateUrls(urls: string[], source: string): string[] {
  const out: string[] = []
  for (const url of urls) {
    const rejectionReason = getNonBrandAssetReason(url)
    if (rejectionReason) {
      log('rejected non-brand candidate', {
        source,
        reason: rejectionReason,
        url,
      })
      continue
    }
    out.push(url)
  }
  return out
}

function dedupe(list: string[]): string[] {
  const set = new Set<string>()
  const out: string[] = []
  for (const u of list) {
    const key = u.trim()
    if (!key || set.has(key)) continue
    set.add(key)
    out.push(key)
  }
  return out
}

/**
 * Quick check if the URL is an image: prefer HEAD, fall back to GET if needed.
 * Also tolerates SVG served as text/xml or image/svg+xml.
 */
async function looksLikeImage(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { accept: 'image/*' },
    })
    if (head.ok) {
      const ct = (head.headers.get('content-type') || '').toLowerCase()
      return isImageContentType(ct)
    }
  } catch {
    /* ignore and try GET */
  }
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: { accept: 'image/*' },
    })
    if (!res.ok) return false
    const ct = (res.headers.get('content-type') || '').toLowerCase()
    return isImageContentType(ct)
  } catch {
    return false
  }
}

function isImageContentType(ct: string): boolean {
  return (
    ct.startsWith('image/') || ct.includes('svg') || ct.includes('xml') // some servers send svg as text/xml
  )
}

function scoreCandidate(url: string): number {
  let score = 0
  const u = url.toLowerCase()
  // Base by extension
  if (u.endsWith('.svg')) score += 100
  else if (u.endsWith('.png') || u.endsWith('.webp')) score += 90
  else if (u.endsWith('.ico')) score += 80
  else score += 70 // unknown but image-like

  // Path hints
  if (u.includes('logo')) score += 15
  if (u.includes('apple-touch-icon')) score += 10
  if (u.includes('favicon')) score += 5

  // Prefer not obviously tiny
  if (u.includes('32x32') || u.includes('16x16')) score -= 15
  if (u.includes('192x192') || u.includes('512x512')) score += 5

  return score
}

async function fallbackChain(
  homeOrDomain: string,
  seed?: string
): Promise<string> {
  // try unavatar (site avatar) → google s2 → picsum
  const domain = safeDomain(homeOrDomain)
  if (domain) {
    log('fallback chain: resolved domain', { domain })
    const clearbit = `https://logo.clearbit.com/${domain}?size=${CLEARBIT_SIZE}`
    if (await looksLikeImage(clearbit)) {
      log('fallback chain: using clearbit', { url: clearbit })
      return clearbit
    }
    const unavatar = `https://unavatar.io/${domain}?fallback=false`
    if (await looksLikeImage(unavatar)) {
      log('fallback chain: using unavatar', { url: unavatar })
      return unavatar
    }

    const s2 = `https://www.google.com/s2/favicons?sz=128&domain=${encodeURIComponent(
      domain
    )}`
    if (await looksLikeImage(s2)) {
      log('fallback chain: using google s2', { url: s2 })
      return s2
    }
  }

  const randSeed =
    seed?.replace(/\s+/g, '-').toLowerCase() ||
    Math.floor(Math.random() * 10_000).toString()
  const placeholder = `https://picsum.photos/seed/${randSeed}/96/96`
  log('fallback chain: using placeholder', { url: placeholder, seed })
  return placeholder
}

async function probeCandidates(
  urls: string[]
): Promise<Array<{ url: string; score: number }>> {
  const results: Array<{ url: string; score: number }> = []
  const queue = [...urls]
  const workers = Array.from(
    {
      length: Math.min(PROBE_CONCURRENCY, queue.length || 1),
    },
    () => worker()
  )
  await Promise.all(workers)
  return results

  async function worker() {
    while (queue.length) {
      const candidate = queue.shift()
      if (!candidate) return
      const rejectionReason = getNonBrandAssetReason(candidate)
      if (rejectionReason) {
        log('candidate rejected before probe', {
          candidate,
          reason: rejectionReason,
        })
        continue
      }
      const ok = await looksLikeImage(candidate)
      if (!ok) continue
      const score = scoreCandidate(candidate)
      log('candidate ok', { candidate, score })
      results.push({ url: candidate, score })
    }
  }
}

function safeDomain(input: string): string | null {
  try {
    const u = new URL(input)
    return u.hostname || null
  } catch {
    // maybe raw domain
    if (/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(input)) return input
    return null
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
