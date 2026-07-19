import {
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  createError,
  send,
  type H3Event,
} from 'h3'
import { isIP } from 'node:net'

const MAX_REDIRECTS = 5
const MAX_IMAGE_BYTES = 10 * 1024 * 1024

function matchesBytes(
  bytes: Uint8Array,
  signature: readonly number[],
  offset = 0
): boolean {
  return signature.every((value, index) => bytes[offset + index] === value)
}

function detectRasterImageContentType(bytes: Uint8Array): string {
  if (matchesBytes(bytes, [0xff, 0xd8, 0xff])) return 'image/jpeg'

  if (
    matchesBytes(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return 'image/png'
  }

  if (
    matchesBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    matchesBytes(bytes, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return 'image/gif'
  }

  if (
    matchesBytes(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matchesBytes(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return 'image/webp'
  }

  return ''
}

function normalizeHostname(hostname: string): string {
  return hostname.toLowerCase().replace(/^\[|\]$/g, '')
}

function isPrivateIpv4(hostname: string): boolean {
  const parts = hostname.split('.').map((part) => Number(part))
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return false
  }

  const [a, b] = parts
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  if (a >= 224) return true
  return false
}

function isPrivateIpv6(hostname: string): boolean {
  const normalized = hostname.toLowerCase()
  return (
    normalized === '::' ||
    normalized === '::1' ||
    normalized.startsWith('fc') ||
    normalized.startsWith('fd') ||
    normalized.startsWith('fe80:')
  )
}

function assertAllowedImageUrl(rawUrl: string): URL {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid image URL',
    })
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid protocol, must be http/https',
    })
  }

  const hostname = normalizeHostname(parsed.hostname)
  const ipVersion = isIP(hostname)
  const blockedHostname =
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')

  if (
    blockedHostname ||
    (ipVersion === 4 && isPrivateIpv4(hostname)) ||
    (ipVersion === 6 && isPrivateIpv6(hostname))
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image proxy target is not allowed',
    })
  }

  return parsed
}

async function fetchAllowedImage(url: URL) {
  let current = url

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const response = await fetch(current, { redirect: 'manual' })

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location')
      if (!location) {
        throw createError({
          statusCode: 502,
          statusMessage: 'Image proxy redirect missing location',
        })
      }

      current = assertAllowedImageUrl(new URL(location, current).toString())
      continue
    }

    return { response, finalUrl: current.toString() }
  }

  throw createError({
    statusCode: 502,
    statusMessage: 'Image proxy redirect limit exceeded',
  })
}

function isHttpError(error: unknown): error is { statusCode: number } {
  return !!error && typeof error === 'object' && 'statusCode' in error
}

export default defineEventHandler(async (event: H3Event) => {
  const { url } = getQuery(event)

  if (!url || typeof url !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing or invalid URL parameter',
    })
  }

  const parsedUrl = assertAllowedImageUrl(url)

  try {
    const t0 = Date.now()
    const { response, finalUrl } = await fetchAllowedImage(parsedUrl)

    if (!response.ok) {
      throw createError({
        statusCode: response.status,
        statusMessage: `Failed to fetch image: ${response.statusText}`,
      })
    }

    const upstreamContentType = response.headers.get('content-type') || ''

    const contentLength =
      response.headers.get('content-length') || ''
    const contentLengthBytes = Number(contentLength)
    if (
      Number.isFinite(contentLengthBytes) &&
      contentLengthBytes > MAX_IMAGE_BYTES
    ) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image proxy target is too large',
      })
    }

    const imageBuffer = await response.arrayBuffer()
    if (imageBuffer.byteLength > MAX_IMAGE_BYTES) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image proxy target is too large',
      })
    }

    const detectedContentType = detectRasterImageContentType(
      new Uint8Array(imageBuffer)
    )
    const contentType = upstreamContentType.toLowerCase().startsWith('image/')
      ? upstreamContentType
      : detectedContentType

    if (!contentType) {
      throw createError({
        statusCode: 415,
        statusMessage: 'Image proxy target did not return an image',
      })
    }

    // Dev-time observability
    if (process.env.NODE_ENV !== 'production') {
      console.log('[proxy/image] upstream', {
        url: finalUrl,
        status: response.status,
        ok: response.ok,
        upstreamContentType,
        contentType,
        contentLength: contentLength || `${imageBuffer.byteLength}`,
        ms: Date.now() - t0,
      })
    }

    setResponseHeaders(event, {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
      'Access-Control-Allow-Origin': '*',
    })

    return send(event, Buffer.from(imageBuffer))
  } catch (error: any) {
    if (isHttpError(error)) throw error

    console.error('[proxy/image] error:', error?.message || error)
    throw createError({
      statusCode: 502,
      statusMessage: 'Image proxy failed',
    })
  }
})
