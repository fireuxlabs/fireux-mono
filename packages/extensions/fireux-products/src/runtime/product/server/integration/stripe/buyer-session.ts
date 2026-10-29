import { createHash } from 'node:crypto'
import { useRuntimeConfig } from '#imports'
import { getRequestURL, useSession, type H3Event } from 'h3'

/** Native encrypted, host-only proof of checkouts started by this browser. */
export function checkoutBuyerSession(event: H3Event, secret: string) {
  const appId = String(useRuntimeConfig(event).public.fireux.id)
  return useSession<{ checkouts: string[] }>(event, {
    name: `fireux-checkout-${appId}`,
    password: createHash('sha256')
      .update(`fireux-products-buyer:${secret}`)
      .digest('hex'),
    maxAge: 86_400,
    sessionHeader: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      secure: getRequestURL(event).protocol === 'https:',
      path: '/',
    },
  })
}
