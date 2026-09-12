import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { resolveKitchenAllowance } from '../../runtime/kitchen/utils/kitchen-capacity.ts'

const source = readFileSync(
  new URL(
    '../../runtime/kitchen/server/index/onboarding/onboarding-policy.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/import[\s\S]*?from ['"][^'"]+['"]\n/g, '')
  .replace(/^export /gm, '')
const kitchenOnboardingAccessDecision = compileFunction(
  `${stripTypeScriptTypes(source)}\nreturn kitchenOnboardingAccessDecision`,
  ['resolveKitchenAllowance']
)(resolveKitchenAllowance)

const activeTeam = { user_id: 'user', role_ids: [] }
const decide = (overrides: Record<string, unknown> = {}) =>
  kitchenOnboardingAccessDecision({
    kitchen: { status: 'active' },
    teamMember: activeTeam,
    uid: 'user',
    role: 'user',
    canCreate: true,
    kitchenId: 'kitchen',
    membership: { role: 'user', subscription: 'free' },
    kitchenIds: [],
    ...overrides,
  })
test('active Team access without association offers Add to My Kitchens', () => {
  assert.deepEqual(decide(), { action: 'connect', can_complete: true })
})
test('an associated kitchen with active Team access opens even above retained capacity', () => {
  assert.deepEqual(
    decide({
      membership: {
        role: 'user',
        subscription: 'premium',
      },
      kitchenIds: ['kitchen', 'retained'],
    }),
    { action: 'open', can_complete: true }
  )
})
test('an existing association opens without a separate roster record', () => {
  assert.deepEqual(
    decide({
      teamMember: null,
      membership: { role: 'user', subscription: 'free' },
      kitchenIds: ['kitchen'],
    }),
    { action: 'open', can_complete: true }
  )
})
test('another person roster link never grants an association', () => {
  assert.equal(
    decide({ teamMember: { user_id: 'someone-else' } }).can_complete,
    false
  )
})
test('existing unassociated Kitchen without Team access requires access', () => {
  assert.equal(decide({ teamMember: null }).action, 'request_access')
})
test('Free and Premium block both new kitchens and new associations at capacity', () => {
  for (const subscription of ['free', 'premium']) {
    for (const kitchen of [null, { status: 'active' }]) {
      assert.equal(
        decide({
          kitchen,
          membership: { role: 'user', subscription },
          kitchenIds: ['other'],
        }).can_complete,
        false
      )
    }
  }
})
test('Business permits a new kitchen and authorized association', () => {
  const membership = {
    role: 'user',
    subscription: 'business',
  }
  assert.equal(
    decide({ kitchen: null, membership, kitchenIds: ['other'] }).action,
    'create'
  )
  assert.equal(decide({ membership, kitchenIds: ['other'] }).action, 'connect')
  assert.equal(
    decide({ membership, kitchenIds: ['other'], teamMember: null })
      .can_complete,
    false
  )
})
test('creation disabled remains blocked', () => {
  assert.equal(decide({ kitchen: null, canCreate: false }).can_complete, false)
})
