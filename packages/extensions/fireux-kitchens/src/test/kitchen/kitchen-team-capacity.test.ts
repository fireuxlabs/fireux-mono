import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canAddKitchenTeamMember,
  kitchenTeamMemberLimit,
} from '../../runtime/kitchen/utils/team.ts'

const capacity = {
  'kitchen.team': { free: 3, premium: 7, business: null },
}

test('Kitchen Team capacity follows the current subscription policy', () => {
  assert.equal(kitchenTeamMemberLimit(capacity, 'free'), 3)
  assert.equal(kitchenTeamMemberLimit(capacity, 'premium'), 7)
  assert.equal(kitchenTeamMemberLimit(capacity, 'business'), null)

  assert.equal(canAddKitchenTeamMember(capacity, 'free', 2), true)
  assert.equal(canAddKitchenTeamMember(capacity, 'free', 3), false)
  assert.equal(canAddKitchenTeamMember(capacity, 'premium', 6), true)
  assert.equal(canAddKitchenTeamMember(capacity, 'premium', 7), false)
  assert.equal(canAddKitchenTeamMember(capacity, 'business', 10_000), true)
})
