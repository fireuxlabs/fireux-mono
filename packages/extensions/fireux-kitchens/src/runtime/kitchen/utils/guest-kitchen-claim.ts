/** Browser-owned recovery proof; never publish it in workspace/page context. */
export type GuestKitchenClaim = { kitchenId: string; secret: string }
const key = (appId: string) => `fireux-kitchen-claim:${appId}`

export function readGuestKitchenClaim(appId: string): GuestKitchenClaim | null {
  if (!import.meta.client) return null
  try {
    const raw = localStorage.getItem(key(appId))
    if (!raw) return null
    const value = JSON.parse(raw)
    if (
      typeof value.kitchenId !== 'string' ||
      !value.kitchenId ||
      value.kitchenId.includes('/') ||
      typeof value.secret !== 'string' ||
      !/^[a-f0-9]{64}$/.test(value.secret)
    )
      return null
    return { kitchenId: value.kitchenId, secret: value.secret }
  } catch {
    return null
  }
}

export async function rememberGuestKitchenClaim(
  appId: string,
  kitchenId: string
): Promise<GuestKitchenClaim> {
  return navigator.locks.request(key(appId), () => {
    const existing = readGuestKitchenClaim(appId)
    if (existing) {
      if (existing.kitchenId !== kitchenId)
        throw new Error('Connect your existing guest Kitchen first.')
      return existing
    }
    const secret = Array.from(
      crypto.getRandomValues(new Uint8Array(32)),
      (byte) => byte.toString(16).padStart(2, '0')
    ).join('')
    const claim = { kitchenId, secret }
    // Persist before requesting creation, so a lost response is safely retryable.
    localStorage.setItem(key(appId), JSON.stringify(claim))
    return claim
  })
}

export function clearGuestKitchenClaim(
  appId: string,
  completed: GuestKitchenClaim
) {
  const current = readGuestKitchenClaim(appId)
  if (
    current?.kitchenId === completed.kitchenId &&
    current.secret === completed.secret
  )
    localStorage.removeItem(key(appId))
}
