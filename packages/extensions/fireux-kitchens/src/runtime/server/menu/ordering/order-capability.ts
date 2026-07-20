// Concurrent edit — 2026-07-20 15:20 CEST — Anonymous Order capability pass: authorize canonical customer Order access without exposing a bearer secret at rest.
import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from 'node:crypto'
import {
  createError,
  getHeader,
  type H3Event,
} from 'h3'
import { firebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import {
  MENU_ORDER_CAPABILITY_HEADER,
  readMenuOrderCapabilityToken,
} from '../../../utils/menu-order-capability.ts'

const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/
const text = (value: unknown) => String(value ?? '').trim()

export type MenuOrderCustomerAccess = {
  capabilityToken: string
  customerUid: string
}

export function createMenuOrderCapability() {
  const token = randomBytes(32).toString('base64url')

  return {
    token,
    hash: hashMenuOrderCapability(token),
  }
}

export async function readMenuOrderCustomerAccess(
  event: H3Event
): Promise<MenuOrderCustomerAccess> {
  const capabilityToken = readMenuOrderCapabilityToken(
    getHeader(event, MENU_ORDER_CAPABILITY_HEADER)
  )
  const bearerUser = await firebaseBearerUser(event).catch(() => null)

  return {
    capabilityToken,
    customerUid: bearerUser?.uid || '',
  }
}

export function requireMenuOrderCustomerAccess(
  access: MenuOrderCustomerAccess,
  order: Record<string, unknown>
) {
  if (
    access.capabilityToken &&
    matchesMenuOrderCapability(
      access.capabilityToken,
      text(order.customer_capability_hash)
    )
  ) {
    return { actorId: 'order-capability' }
  }

  if (
    access.customerUid &&
    access.customerUid === text(order.customer_uid)
  ) {
    return { actorId: access.customerUid }
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Order not found.',
  })
}

export function hashMenuOrderCapability(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function matchesMenuOrderCapability(token: string, storedHash: string) {
  if (!readMenuOrderCapabilityToken(token)) return false
  if (!SHA256_HEX_PATTERN.test(storedHash)) return false

  const candidate = createHash('sha256').update(token).digest()
  const stored = Buffer.from(storedHash, 'hex')

  return stored.length === candidate.length && timingSafeEqual(stored, candidate)
}
