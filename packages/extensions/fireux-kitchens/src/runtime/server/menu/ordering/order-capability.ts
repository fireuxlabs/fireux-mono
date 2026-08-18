// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: authorize canonical customer Order access without exposing a bearer secret at rest.
import { createError, getHeader, type H3Event } from 'h3'
import { firebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import {
  MENU_ORDER_CAPABILITY_HEADER,
  readMenuOrderCapabilityToken,
} from '../../../utils/menu-order-capability.ts'
import { matchesMenuOrderCapability } from './order-capability-token.ts'

export { createMenuOrderCapability } from './order-capability-token.ts'

const text = (value: unknown) => String(value ?? '').trim()

export type MenuOrderCustomerAccess = {
  capabilityToken: string
  customerUid: string
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

  if (access.customerUid && access.customerUid === text(order.customer_uid)) {
    return { actorId: access.customerUid }
  }

  throw createError({
    statusCode: 404,
    statusMessage: 'Order not found.',
  })
}
