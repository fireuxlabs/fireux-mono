/* eslint-disable no-console */
import type { PlaceCard } from '../models/place.model'

const LOGO_ENDPOINT = '/api/places/logo'
const DETAILS_ENDPOINT = '/api/places/details'

const logoResultCache = new Map<string, string | null>()
const logoPromiseCache = new Map<string, Promise<string | null>>()
const detailsResultCache = new Map<string, PlaceDetailsResult | null>()
const detailsPromiseCache = new Map<string, Promise<PlaceDetailsResult | null>>()

interface PlaceDetailsResult {
  website?: string | null
  url?: string | null
}

const canonicalPlaceId = (id?: string | null) =>
  (id ?? '').trim().replace(/^"+/, '').replace(/"+$/, '')

export async function loadLogoForPlace(
  place: PlaceCard.Cell
): Promise<string | null> {
  if (typeof window === 'undefined') return place.avatar ?? null
  const placeId = canonicalPlaceId(place.place_id)
  if (!placeId) return place.avatar ?? null

  if (logoResultCache.has(placeId)) {
    return logoResultCache.get(placeId) ?? null
  }

  if (logoPromiseCache.has(placeId)) {
    return logoPromiseCache.get(placeId) ?? null
  }

  const promise = fetchLogo(place, placeId)
    .then((url) => {
      logoResultCache.set(placeId, url)
      return url
    })
    .finally(() => {
      logoPromiseCache.delete(placeId)
    })

  logoPromiseCache.set(placeId, promise)
  return promise
}

async function fetchLogo(
  place: PlaceCard.Cell,
  placeId: string
): Promise<string | null> {
  try {
    const hint = await resolveWebsite(placeId)
    const logoUrl = new URL(LOGO_ENDPOINT, window.location.origin)

    if (hint?.website) {
      logoUrl.searchParams.set('website', hint.website)
    } else if (hint?.url) {
      const domain = extractDomain(hint.url)
      if (domain) logoUrl.searchParams.set('domain', domain)
    }

    if (!logoUrl.searchParams.has('website') && !logoUrl.searchParams.has('domain')) {
      const domainFromName = extractDomain(place.formatted_address)
      if (domainFromName) {
        logoUrl.searchParams.set('domain', domainFromName)
      }
    }

    logoUrl.searchParams.set('q', place.name)

    const res = await fetch(logoUrl.toString(), {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      console.warn('[places][logos] logo fetch failed', {
        placeId,
        status: res.status,
      })
      return null
    }

    const json = await res.json()
    const url = typeof json?.url === 'string' ? json.url : null
    return url
  } catch (error) {
    console.warn('[places][logos] logo fetch error', { placeId, error })
    return null
  }
}

async function resolveWebsite(placeId: string): Promise<PlaceDetailsResult | null> {
  if (detailsResultCache.has(placeId)) {
    return detailsResultCache.get(placeId) ?? null
  }

  if (detailsPromiseCache.has(placeId)) {
    return detailsPromiseCache.get(placeId) ?? null
  }

  const promise = (async () => {
    try {
      const url = new URL(DETAILS_ENDPOINT, window.location.origin)
      url.searchParams.set('place_id', placeId)
      url.searchParams.set('fields', 'website,url')

      const res = await fetch(url.toString(), {
        headers: { accept: 'application/json' },
        cache: 'no-store',
      })
      if (!res.ok) {
        return null
      }

      const json = await res.json()
      const result = (json?.result ?? null) as Record<string, any> | null
      if (!result) return null

      const website = normalizeUrl(result.website)
      const mapsUrl = normalizeUrl(result.url)

      const payload = { website, url: mapsUrl }
      detailsResultCache.set(placeId, payload)
      return payload
    } catch (error) {
      console.warn('[places][logos] details fetch failed', { placeId, error })
      return null
    }
  })()
    .finally(() => {
      detailsPromiseCache.delete(placeId)
    })

  detailsPromiseCache.set(placeId, promise)
  return promise
}

function extractDomain(input?: string | null): string | null {
  if (!input) return null
  const normalized = normalizeUrl(input)
  if (normalized) {
    try {
      const url = new URL(normalized)
      if (url.hostname) return url.hostname
    } catch {
      // ignore
    }
  }
  const match = /\b([a-z0-9-]+(?:\.[a-z0-9-]+)+)\b/i.exec(input)
  return match ? match[1] : null
}

function normalizeUrl(value?: string | null): string | null {
  if (!value || typeof value !== 'string') return null
  try {
    const url = new URL(value)
    if (!url.protocol) {
      url.protocol = 'https:'
    }
    return url.toString()
  } catch {
    if (/^https?:\/\//i.test(value)) return value
    return `https://${value}`
  }
}
