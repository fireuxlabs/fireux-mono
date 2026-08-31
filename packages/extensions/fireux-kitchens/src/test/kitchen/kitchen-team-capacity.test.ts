import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canAddKitchenTeamMember,
  kitchenTeamMemberLimit,
} from '../../runtime/kitchen/utils/team.ts'

test('Kitchen Team capacity follows the current subscription policy', () => {
  assert.equal(kitchenTeamMemberLimit('free'), 3)
  assert.equal(kitchenTeamMemberLimit('premium'), 7)
  assert.equal(kitchenTeamMemberLimit('business'), null)

  assert.equal(canAddKitchenTeamMember('free', 2), true)
  assert.equal(canAddKitchenTeamMember('free', 3), false)
  assert.equal(canAddKitchenTeamMember('premium', 6), true)
  assert.equal(canAddKitchenTeamMember('premium', 7), false)
  assert.equal(canAddKitchenTeamMember('business', 10_000), true)
})
