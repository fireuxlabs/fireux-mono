// Concurrent edit — 2026-07-20 13:20 CEST — Avatar proxy resource pass: bound DNS retries, total request time, and response buffering.
// Concurrent edit — 2026-07-20 14:21 CEST — Avatar proxy concurrency: cap in-flight upstream buffers per server instance.
// Concurrent edit — 2026-07-22 00:33 CEST — Public image fetch seam: extract the bounded raster fetch policy for server reuse.
import { lookup } from 'node:dns/promises'
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import { isIP, type LookupFunction } from 'node:net'
import type { IncomingHttpHeaders } from 'node:http'
import { createError } from 'h3'

const MAX_REDIRECTS = 5
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 10_000
const TOTAL_REQUEST_TIMEOUT_MS = 15_000
const MAX_ADDRESSES_PER_HOST = 2
const MAX_ADDRESS_ATTEMPTS = 4
const MAX_CONCURRENT_FETCHES = 8
let activeFetches = 0

type ResolvedAddress = {
  address: string
  family: 4 | 6
}

type PinnedResponse = {
  body: Buffer
  headers: IncomingHttpHeaders
  statusCode: number
  statusMessage: string
}

export type PublicRasterImageResult = {
  buffer: Buffer
  contentType: string
  finalUrl: string
  status: number
}

function deadlineError() {
  return createError({
    statusCode: 504,
    statusMessage: 'Image proxy request timed out',
  })
}

function remainingTimeoutMs(deadline: number): number {
  const remaining = deadline - Date.now()
  if (remaining <= 0) throw deadlineError()
  return remaining
}

async function withinDeadline<T>(promise: Promise<T>, deadline: number): Promise<T> {
  const timeout = remainingTimeoutMs(deadline)
  return new Promise<T>((resolve, reject) => {
    const timer = globalThis.setTimeout(() => reject(deadlineError()), timeout)
    promise.then(
      (value) => {
        globalThis.clearTimeout(timer)
        resolve(value)
      },
      (error) => {
        globalThis.clearTimeout(timer)
        reject(error)
      }
    )
  })
}

function declaredContentLength(headers: IncomingHttpHeaders): number {
  const header = headers['content-length'] || ''
  const value = Array.isArray(header) ? header[0] : header
  return Number(value)
}

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

function ipv4Parts(address: string): number[] {
  return address.split('.').map(Number)
}

function isReservedIpv4(address: string): boolean {
  const [a, b, c] = ipv4Parts(address)

  if (a === 0 || a === 10 || a === 127 || a >= 224) return true
  if (a === 100 && b >= 64 && b <= 127) return true
  if (a === 169 && b === 254) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 0 && c === 0) return true
  if (a === 192 && b === 0 && c === 2) return true
  if (a === 192 && b === 31 && c === 196) return true
  if (a === 192 && b === 52 && c === 193) return true
  if (a === 192 && b === 88 && c === 99) return true
  if (a === 192 && b === 168) return true
  if (a === 192 && b === 175 && c === 48) return true
  if (a === 198 && (b === 18 || b === 19)) return true
  if (a === 198 && b === 51 && c === 100) return true
  if (a === 203 && b === 0 && c === 113) return true

  return false
}

function ipv6Words(address: string): number[] | null {
  const normalized = address.toLowerCase()
  const halves = normalized.split('::')
  if (halves.length > 2) return null

  const expand = (half: string) => {
    const tokens = half ? half.split(':') : []
    const embeddedIpv4 = tokens.at(-1)
    if (!embeddedIpv4?.includes('.')) return tokens
    if (isIP(embeddedIpv4) !== 4) return []

    const [a, b, c, d] = ipv4Parts(embeddedIpv4)
    return [
      ...tokens.slice(0, -1),
      ((a << 8) | b).toString(16),
      ((c << 8) | d).toString(16),
    ]
  }

  const head = expand(halves[0])
  const tail = halves.length === 2 ? expand(halves[1]) : []
  if ((halves[0] && !head.length) || (halves[1] && !tail.length)) return null

  const missing = 8 - head.length - tail.length
  const words = halves.length === 2
    ? [...head, ...Array.from({ length: missing }, () => '0'), ...tail]
    : head

  if (words.length !== 8 || words.some(word => !/^[0-9a-f]{1,4}$/.test(word))) {
    return null
  }

  return words.map(word => Number.parseInt(word, 16))
}

function isReservedIpv6(address: string): boolean {
  const words = ipv6Words(address)
  if (!words) return true

  const isUnspecified = words.every(word => word === 0)
  const isLoopback = words.slice(0, 7).every(word => word === 0) && words[7] === 1
  const isIpv4Mapped = words.slice(0, 5).every(word => word === 0) && words[5] === 0xffff
  const isUniqueLocal = (words[0] & 0xfe00) === 0xfc00
  const isLinkLocal = (words[0] & 0xffc0) === 0xfe80
  const isMulticast = (words[0] & 0xff00) === 0xff00
  const isDocumentation = words[0] === 0x2001 && words[1] === 0x0db8
  const isDeprecatedOrchid = words[0] === 0x2001 && words[1] === 0x0010
  const is6to4 = words[0] === 0x2002
  const isGlobalUnicast = (words[0] & 0xe000) === 0x2000

  return (
    isUnspecified ||
    isLoopback ||
    isIpv4Mapped ||
    isUniqueLocal ||
    isLinkLocal ||
    isMulticast ||
    isDocumentation ||
    isDeprecatedOrchid ||
    is6to4 ||
    !isGlobalUnicast
  )
}

function assertPublicAddress(address: string, family: number): ResolvedAddress {
  if (
    (family === 4 && isReservedIpv4(address)) ||
    (family === 6 && isReservedIpv6(address)) ||
    (family !== 4 && family !== 6)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image proxy target is not allowed',
    })
  }

  return { address, family: family as 4 | 6 }
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

  if (parsed.username || parsed.password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image proxy target credentials are not allowed',
    })
  }

  const hostname = normalizeHostname(parsed.hostname)
  const ipVersion = isIP(hostname)
  const blockedHostname =
    hostname === 'localhost' ||
    hostname.endsWith('.localhost') ||
    hostname.endsWith('.local') ||
    hostname.endsWith('.internal')

  if (blockedHostname) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Image proxy target is not allowed',
    })
  }

  if (ipVersion !== 0) assertPublicAddress(hostname, ipVersion)

  return parsed
}

async function resolvePublicAddresses(
  url: URL,
  deadline: number
): Promise<ResolvedAddress[]> {
  const hostname = normalizeHostname(url.hostname)
  const ipVersion = isIP(hostname)

  if (ipVersion !== 0) {
    remainingTimeoutMs(deadline)
    return [assertPublicAddress(hostname, ipVersion)]
  }

  let records: ResolvedAddress[]
  try {
    records = await withinDeadline(
      lookup(hostname, { all: true, verbatim: true }) as Promise<ResolvedAddress[]>,
      deadline
    )
  } catch (error) {
    if (isHttpError(error)) throw error
    throw createError({
      statusCode: 502,
      statusMessage: 'Image proxy target could not be resolved',
    })
  }

  if (!records.length) {
    throw createError({
      statusCode: 502,
      statusMessage: 'Image proxy target could not be resolved',
    })
  }

  // Reject a mixed DNS answer rather than selecting around a private record.
  // A bounded subset then supplies resilient IPv4/IPv6 fallback without turning
  // a single avatar fetch into an unbounded DNS fan-out.
  return records
    .map(record => assertPublicAddress(record.address, record.family))
    .slice(0, MAX_ADDRESSES_PER_HOST)
}

function requestPinnedImage(
  url: URL,
  resolved: ResolvedAddress,
  deadline: number
): Promise<PinnedResponse> {
  const request = url.protocol === 'https:' ? httpsRequest : httpRequest
  const pinnedLookup: LookupFunction = (_hostname, options, callback) => {
    if (options.all) {
      callback(null, [{ address: resolved.address, family: resolved.family }])
      return
    }
    callback(null, resolved.address, resolved.family)
  }

  return new Promise((resolve, reject) => {
    const remaining = remainingTimeoutMs(deadline)
    let deadlineTimer: ReturnType<typeof globalThis.setTimeout> | null = null
    let settled = false
    const succeed = (value: PinnedResponse) => {
      if (settled) return
      settled = true
      if (deadlineTimer) globalThis.clearTimeout(deadlineTimer)
      resolve(value)
    }
    const fail = (error: unknown) => {
      if (settled) return
      settled = true
      if (deadlineTimer) globalThis.clearTimeout(deadlineTimer)
      reject(error)
    }
    const upstream = request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port || undefined,
        path: `${url.pathname}${url.search}`,
        method: 'GET',
        family: resolved.family,
        headers: { Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8' },
        servername: url.hostname,
        lookup: pinnedLookup,
      },
      (response) => {
        if (
          response.statusCode &&
          response.statusCode >= 300 &&
          response.statusCode < 400
        ) {
          const redirect = {
            body: Buffer.alloc(0),
            headers: response.headers,
            statusCode: response.statusCode || 502,
            statusMessage: response.statusMessage || '',
          }
          response.destroy()
          succeed(redirect)
          return
        }

        if (declaredContentLength(response.headers) > MAX_IMAGE_BYTES) {
          response.on('error', () => {})
          response.destroy()
          fail(createError({
            statusCode: 413,
            statusMessage: 'Image proxy target is too large',
          }))
          return
        }

        const chunks: Buffer[] = []
        let byteLength = 0

        response.on('data', (chunk: Buffer) => {
          byteLength += chunk.length
          if (byteLength > MAX_IMAGE_BYTES) {
            response.destroy()
            fail(createError({
              statusCode: 413,
              statusMessage: 'Image proxy target is too large',
            }))
            return
          }
          chunks.push(chunk)
        })
        response.on('aborted', () => fail(new Error('Image proxy response aborted')))
        response.on('error', fail)
        response.on('end', () => succeed({
          body: Buffer.concat(chunks),
          headers: response.headers,
          statusCode: response.statusCode || 502,
          statusMessage: response.statusMessage || '',
        }))
      }
    )

    deadlineTimer = globalThis.setTimeout(() => {
      upstream.destroy(deadlineError())
    }, remaining)
    upstream.setTimeout(
      Math.min(REQUEST_TIMEOUT_MS, remaining),
      () => {
        upstream.destroy(new Error('Image proxy upstream request timed out'))
      }
    )
    upstream.on('error', fail)
    upstream.end()
  })
}

async function fetchAllowedImage(url: URL) {
  let current = url
  const deadline = Date.now() + TOTAL_REQUEST_TIMEOUT_MS
  let addressAttempts = 0

  for (let redirectCount = 0; redirectCount <= MAX_REDIRECTS; redirectCount += 1) {
    const addresses = await resolvePublicAddresses(current, deadline)
    let response: PinnedResponse | undefined
    let requestError: unknown

    for (const address of addresses) {
      if (addressAttempts >= MAX_ADDRESS_ATTEMPTS) {
        throw createError({
          statusCode: 502,
          statusMessage: 'Image proxy address attempt limit exceeded',
        })
      }
      addressAttempts += 1
      try {
        response = await requestPinnedImage(current, address, deadline)
        break
      } catch (error) {
        requestError = error
      }
    }

    if (!response) {
      if (Date.now() >= deadline) throw deadlineError()
      throw requestError || new Error('Image proxy upstream request failed')
    }

    if (response.statusCode >= 300 && response.statusCode < 400) {
      const location = response.headers.location
      const redirectLocation = Array.isArray(location) ? location[0] : location
      if (!redirectLocation) {
        throw createError({
          statusCode: 502,
          statusMessage: 'Image proxy redirect missing location',
        })
      }

      current = assertAllowedImageUrl(new URL(redirectLocation, current).toString())
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

export async function fetchPublicRasterImage(
  url: string
): Promise<PublicRasterImageResult> {
  const parsedUrl = assertAllowedImageUrl(url)

  if (activeFetches >= MAX_CONCURRENT_FETCHES) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Image proxy is busy; try again shortly',
    })
  }
  activeFetches += 1

  try {
    const { response, finalUrl } = await fetchAllowedImage(parsedUrl)

    if (response.statusCode < 200 || response.statusCode >= 300) {
      throw createError({
        statusCode: response.statusCode,
        statusMessage: `Failed to fetch image: ${response.statusMessage}`,
      })
    }

    const contentLength = response.headers['content-length'] || ''
    const contentLengthValue = Array.isArray(contentLength) ? contentLength[0] : contentLength
    const contentLengthBytes = Number(contentLengthValue)
    if (
      Number.isFinite(contentLengthBytes) &&
      contentLengthBytes > MAX_IMAGE_BYTES
    ) {
      throw createError({
        statusCode: 413,
        statusMessage: 'Image proxy target is too large',
      })
    }

    const detectedContentType = detectRasterImageContentType(
      new Uint8Array(response.body)
    )
    if (!detectedContentType) {
      throw createError({
        statusCode: 415,
        statusMessage: 'Image proxy target did not return a supported raster image',
      })
    }

    return {
      buffer: response.body,
      contentType: detectedContentType,
      finalUrl,
      status: response.statusCode,
    }
  } finally {
    activeFetches = Math.max(0, activeFetches - 1)
  }
}
