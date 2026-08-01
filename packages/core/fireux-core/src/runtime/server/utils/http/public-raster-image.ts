// Concurrent edit — 2026-07-20 13:20 CEST — Avatar proxy resource pass: bound DNS retries, total request time, and response buffering.
// Concurrent edit — 2026-07-20 14:21 CEST — Avatar proxy concurrency: cap in-flight upstream buffers per server instance.
// Concurrent edit — 2026-07-22 00:33 CEST — Public image fetch seam: extract the bounded raster fetch policy for server reuse.
import { request as httpRequest } from 'node:http'
import { request as httpsRequest } from 'node:https'
import type { LookupFunction } from 'node:net'
import type { IncomingHttpHeaders } from 'node:http'
import { createError } from 'h3'
import {
  assertAllowedImageUrl,
  deadlineError,
  remainingTimeoutMs,
  resolvePublicAddresses,
  type ResolvedAddress,
} from './public-raster-network-policy'

const MAX_REDIRECTS = 5
const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 10_000
const TOTAL_REQUEST_TIMEOUT_MS = 15_000
const MAX_ADDRESS_ATTEMPTS = 4
const MAX_CONCURRENT_FETCHES = 8
let activeFetches = 0

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
