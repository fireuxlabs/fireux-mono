import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { createError } from 'h3'

const MAX_ADDRESSES_PER_HOST = 2

export type ResolvedAddress = {
  address: string
  family: 4 | 6
}

export function deadlineError() {
  return createError({
    statusCode: 504,
    statusMessage: 'Image proxy request timed out',
  })
}

export function remainingTimeoutMs(deadline: number): number {
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

export function assertAllowedImageUrl(rawUrl: string): URL {
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

export async function resolvePublicAddresses(
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

export function isHttpError(error: unknown): error is { statusCode: number } {
  return !!error && typeof error === 'object' && 'statusCode' in error
}

