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
  ['isAppUserSubscription', 'readMembershipAccessIds']
)((v) => ['free', 'premium', 'business'].includes(v), readMembershipAccessIds)
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
  access: { ids: ['p'], membership_created_at: at },
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
    { access: { ids: [], membership_created_at: at } },
    { access: { ids: ['other'], membership_created_at: at } },
    {
      access: { ids: ['p'], membership_created_at: { ...at, nanoseconds: 2 } },
    },
    { membership: { ...input.membership, role: 'invalid' } },
    { membership: { ...input.membership, subscription: 'unknown' } },
    { access: null, membership: { ...input.membership, kitchens: ['p'] } },
  ])
    assert.equal(allow({ ...input, ...delta }), false)
})
test('malformed grants fail closed', () => {
  assert.throws(() => allow({ ...input, access: { ids: ['p'] } }), {
    statusCode: 409,
  })
})
