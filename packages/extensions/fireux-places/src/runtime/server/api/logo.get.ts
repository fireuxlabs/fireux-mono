import { defineEventHandler, getQuery, createError } from 'h3'

const LOGO_PATHS = [
  'logo.png',
  'logo.svg',
  'logo.jpg',
  'logo.jpeg',
  'logo.webp',
  'logo-dark.png',
  'logo-light.png',
  'favicon.png',
  'favicon.svg',
  'favicon.ico',
  'apple-touch-icon.png',
]

async function urlExists(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: {
        'User-Agent': USER_AGENT,
      },
    })

    if (head.ok) return true

    if (head.status === 405 || head.status === 501) {
      const getRes = await fetch(url, {
        method: 'GET',
        redirect: 'follow',
        headers: {
          'User-Agent': USER_AGENT,
        },
      })
      return getRes.ok
    }

    return false
  } catch {
    return false
  }
}

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36'

function normalizeWebsite(input: string): URL {
  const trimmed = input.trim()
  if (!trimmed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Website is required',
    })
  }

  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return new URL(trimmed)
    }
    return new URL(`https://${trimmed}`)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Website must be a valid URL',
    })
  }
}

function buildCandidates(website: URL): string[] {
  const candidates = new Set<string>()
  const origin = website.origin.replace(/\/$/, '')

  for (const path of LOGO_PATHS) {
    candidates.add(`${origin}/${path}`)
  }

  // If the site uses a common assets prefix, try that as well
  const commonPrefixes = ['assets', 'static', 'img', 'images']
  for (const prefix of commonPrefixes) {
    for (const path of LOGO_PATHS) {
      candidates.add(`${origin}/${prefix}/${path}`)
    }
  }

  return Array.from(candidates)
}

function buildFaviconFallback(website: URL) {
  return `https://www.google.com/s2/favicons?sz=256&domain_url=${encodeURIComponent(
    website.origin
  )}`
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const websiteParam = query.website

  if (!websiteParam || typeof websiteParam !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Query parameter "website" is required',
    })
  }

  const website = normalizeWebsite(websiteParam)
  const candidates = buildCandidates(website)

  for (const candidate of candidates) {
    if (await urlExists(candidate)) {
      return {
        url: candidate,
        source: 'website',
      }
    }
  }

  return {
    url: buildFaviconFallback(website),
    source: 'google-favicon',
  }
})
