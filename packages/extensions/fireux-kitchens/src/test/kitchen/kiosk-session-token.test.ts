import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createKitchenKioskSessionCookie,
  createKitchenKioskSessionToken,
  matchesKitchenKioskSessionToken,
  readKitchenKioskSessionCookie,
} from '../../runtime/kitchen/server/operations/kiosks/session-token.ts'

test('Kiosk device cookie round-trips its scoped locator and opaque token', () => {
  const session = createKitchenKioskSessionToken()
  const cookie = createKitchenKioskSessionCookie(
    { kitchenId: 'interlaken-pizza-id', kioskId: 'front-counter' },
    session.token
  )

  assert.deepEqual(readKitchenKioskSessionCookie(cookie), {
    locator: {
      kitchenId: 'interlaken-pizza-id',
      kioskId: 'front-counter',
    },
    token: session.token,
  })
  assert.equal(
    matchesKitchenKioskSessionToken(session.token, session.hash),
    true
  )
})

test('Kiosk session rejects tampered locators, tokens, and digests', () => {
  const session = createKitchenKioskSessionToken()
  const cookie = createKitchenKioskSessionCookie(
    { kitchenId: 'kitchen', kioskId: 'device' },
    session.token
  )
  const [locator] = cookie.split('.')

  assert.equal(readKitchenKioskSessionCookie(`broken.${session.token}`), null)
  assert.equal(readKitchenKioskSessionCookie(`${locator}.short`), null)
  assert.equal(
    matchesKitchenKioskSessionToken(
      createKitchenKioskSessionToken().token,
      session.hash
    ),
    false
  )
  assert.equal(
    matchesKitchenKioskSessionToken(session.token, '0'.repeat(64)),
    false
  )
})
