// Concurrent edit — 2026-07-20 15:37 CEST — Anonymous Order capability pass: define the shared opaque capability protocol.
export const MENU_ORDER_CAPABILITY_HEADER = 'x-fireux-order-capability'

const MENU_ORDER_CAPABILITY_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function readMenuOrderCapabilityToken(value: unknown) {
  const token = String(value ?? '').trim()

  return MENU_ORDER_CAPABILITY_PATTERN.test(token) ? token : ''
}

export function menuOrderCapabilityHeaders(value: unknown) {
  const token = readMenuOrderCapabilityToken(value)

  return token ? { [MENU_ORDER_CAPABILITY_HEADER]: token } : {}
}

export async function menuOrderAccessHeaders(
  user: { getIdToken: () => Promise<string> } | null | undefined,
  capability: unknown
) {
  const authToken = await user?.getIdToken().catch(() => '')

  return {
    ...menuOrderCapabilityHeaders(capability),
    ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
  }
}
