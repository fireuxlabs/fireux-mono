import { defineEventHandler, getQuery } from 'h3'
import {
  buildCandidates,
  emptyLogo,
  resolveBaseUrl,
  type LogoResponse,
} from '../../../place/server/integration/logo/candidates'
import {
  log,
  logError,
  logWarn,
} from '../../../place/server/integration/logo/logging'
import {
  isAbortError,
  probeCandidates,
} from '../../../place/server/integration/logo/probe'
import { HOMEPAGE_TIMEOUT_MS } from '../../../place/server/integration/logo/settings'

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
      homepageIcon: candidates.filter((x) => x.source === 'homepage-icon')
        .length,
      inlineLogo: candidates.filter((x) => x.source === 'inline-logo').length,
      commonPath: candidates.filter((x) => x.source === 'common-path').length,
      socialLogo: candidates.filter((x) => x.source === 'social-logo').length,
      total: candidates.length,
    })

    const scored = await probeCandidates(candidates)
    if (!scored.length) return emptyLogo('not-found')

    scored.sort((a, b) => b.score - a.score)
    const winner = scored[0]!
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
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
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
