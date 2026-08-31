// Opaque credential mechanics for one trusted Kitchen Kiosk device.
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/
const DIGEST_PATTERN = /^[a-f0-9]{64}$/

export type KitchenKioskSessionLocator = {
  kitchenId: string
  kioskId: string
}

const validSegment = (value: unknown) => {
  const segment = String(value ?? '').trim()
  return Boolean(
    segment &&
      segment !== '.' &&
      segment !== '..' &&
      !segment.includes('/') &&
      !(segment.startsWith('__') && segment.endsWith('__')) &&
      new TextEncoder().encode(segment).length <= 1_500
  )
}

export function createKitchenKioskSessionToken() {
  const token = randomBytes(32).toString('base64url')
  return { token, hash: hashKitchenKioskSessionToken(token) }
}

export function hashKitchenKioskSessionToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function matchesKitchenKioskSessionToken(
  token: string,
  storedHash: string
) {
  if (!TOKEN_PATTERN.test(token) || !DIGEST_PATTERN.test(storedHash))
    return false
  const candidate = createHash('sha256').update(token).digest()
  const stored = Buffer.from(storedHash, 'hex')
  return (
    stored.length === candidate.length && timingSafeEqual(stored, candidate)
  )
}

export function createKitchenKioskSessionCookie(
  locator: KitchenKioskSessionLocator,
  token: string
) {
  if (!validSegment(locator.kitchenId) || !validSegment(locator.kioskId)) {
    throw new Error('Kiosk session locator is invalid.')
  }
  if (!TOKEN_PATTERN.test(token))
    throw new Error('Kiosk session token is invalid.')
  const encoded = Buffer.from(
    JSON.stringify({ k: locator.kitchenId, d: locator.kioskId }),
    'utf8'
  ).toString('base64url')
  return `${encoded}.${token}`
}

export function readKitchenKioskSessionCookie(value: unknown) {
  const cookie = String(value ?? '').trim()
  const separator = cookie.indexOf('.')
  if (separator < 1 || separator !== cookie.lastIndexOf('.')) return null
  const encoded = cookie.slice(0, separator)
  const token = cookie.slice(separator + 1)
  if (!TOKEN_PATTERN.test(token) || !encoded) return null

  try {
    const parsed = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8')
    ) as { k?: unknown; d?: unknown }
    const kitchenId = String(parsed.k ?? '').trim()
    const kioskId = String(parsed.d ?? '').trim()
    if (!validSegment(kitchenId) || !validSegment(kioskId)) return null
    return { locator: { kitchenId, kioskId }, token }
  } catch {
    return null
  }
}
