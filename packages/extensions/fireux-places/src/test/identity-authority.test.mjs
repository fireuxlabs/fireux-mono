import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(
  new URL(
    '../runtime/place/server/identity/mutation-authority.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace(/^export /gm, '')
const accessSource = readFileSync(
  new URL(
    '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[^\n]+\n/gm, '')
  .replace(/^export /gm, '')
const readMembershipAccessIds = compileFunction(
  `${stripTypeScriptTypes(accessSource)};return readMembershipAccessIds`
)()
const allow = compileFunction(
  `${stripTypeScriptTypes(source)};return canKitchenEditPlace`,
  [
    'isAppUserSubscription',
    'readMembershipAccessIds',
    'defineFirestoreReadTarget',
  ]
)(
  (v) => ['free', 'premium', 'business'].includes(v),
  readMembershipAccessIds,
  (value) => value
)
const at = { seconds: 100, nanoseconds: 1 }
const input = {
  uid: 'u',
  placeId: 'p',
  kitchenId: 'p',
  appId: 'app',
  runtimeAppId: 'app',
  kitchenExists: true,
  membershipExists: true,
  membership: { role: 'user', subscription: 'free', created: { at } },
  access: { apps: { app: { ids: ['p'], membership_created_at: at } } },
}
test('current membership-bound Kitchen access allows Place editing', () => {
  assert.equal(allow(input), true)
})
test('missing, revoked, foreign and superseded access deny Place editing', () => {
  for (const delta of [
    { kitchenId: 'other' },
    { appId: 'foreign' },
    { kitchenExists: false },
    { membershipExists: false },
    { access: null },
    { access: { apps: { app: { ids: [], membership_created_at: at } } } },
    {
      access: { apps: { app: { ids: ['other'], membership_created_at: at } } },
    },
    {
      access: {
        apps: {
          app: { ids: ['p'], membership_created_at: { ...at, nanoseconds: 2 } },
        },
      },
    },
    { membership: { ...input.membership, role: 'invalid' } },
    { membership: { ...input.membership, subscription: 'unknown' } },
    { access: null, membership: { ...input.membership, kitchens: ['p'] } },
  ])
    assert.equal(allow({ ...input, ...delta }), false)
})
test('malformed grants fail closed', () => {
  assert.throws(
    () => allow({ ...input, access: { apps: { app: { ids: ['p'] } } } }),
    {
      statusCode: 409,
    }
  )
})

test('Kitchen integration rejects an over-capacity App grant and never selects another App', () => {
  assert.equal(
    allow({
      ...input,
      access: {
        apps: {
          app: {
            ids: Array.from({ length: 51 }, (_, i) =>
              i === 0 ? 'p' : `k-${i}`
            ),
            membership_created_at: at,
          },
        },
      },
    }),
    false
  )
  assert.equal(
    allow({
      ...input,
      access: { apps: { other: { ids: ['p'], membership_created_at: at } } },
    }),
    false
  )
})

test('Kitchen integration rejects malformed envelope and unexpected grant fields', () => {
  for (const access of [
    { apps: Array.from({ length: 2 }, () => input.access.apps.app) },
    { apps: { app: { ...input.access.apps.app, role: 'admin' } } },
    {
      apps: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [
          i === 0 ? 'app' : `a-${i}`,
          input.access.apps.app,
        ])
      ),
    },
  ])
    assert.throws(() => allow({ ...input, access }), { statusCode: 409 })
})
