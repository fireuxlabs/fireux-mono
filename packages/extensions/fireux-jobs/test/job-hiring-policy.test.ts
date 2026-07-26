import assert from 'node:assert/strict'
import test from 'node:test'
import {
  nextApplicationStatus,
  nextEngagementStatus,
  temporaryCapacityAllowsAcceptance,
} from '../src/runtime/utils/job-hiring-policy.ts'

test('employer and candidate application transitions stay separate', () => {
  assert.equal(nextApplicationStatus('submitted', 'offer', 'employer'), 'offered')
  assert.equal(nextApplicationStatus('offered', 'accept', 'candidate'), 'engaged')
  assert.equal(nextApplicationStatus('submitted', 'accept', 'candidate'), null)
  assert.equal(nextApplicationStatus('offered', 'offer', 'employer'), 'offered')
  assert.equal(nextApplicationStatus('engaged', 'withdraw', 'candidate'), null)
  assert.equal(nextApplicationStatus('submitted', 'withdraw', 'employer'), null)
})

test('an engagement can start or finish only once', () => {
  assert.equal(nextEngagementStatus('accepted', 'start'), 'active')
  assert.equal(nextEngagementStatus('accepted', 'complete'), 'completed')
  assert.equal(nextEngagementStatus('active', 'complete'), 'completed')
  assert.equal(nextEngagementStatus('active', 'cancel'), 'cancelled')
  assert.equal(nextEngagementStatus('completed', 'start'), null)
  assert.equal(nextEngagementStatus('cancelled', 'complete'), null)
})

test('permanent and fixed-term hires never consume temporary capacity', () => {
  for (const contractType of ['permanent', 'fixed_term'] as const) {
    assert.equal(
      temporaryCapacityAllowsAcceptance({
        contractType,
        hasPremiumCapacity: false,
        activeTemporaryEngagementCount: 100,
      }),
      true
    )
  }
})

test('Free permits one concurrent temporary engagement', () => {
  assert.equal(
    temporaryCapacityAllowsAcceptance({
      contractType: 'temporary',
      hasPremiumCapacity: false,
      activeTemporaryEngagementCount: 0,
    }),
    true
  )
  assert.equal(
    temporaryCapacityAllowsAcceptance({
      contractType: 'temporary',
      hasPremiumCapacity: false,
      activeTemporaryEngagementCount: 1,
    }),
    false
  )
})

test('Premium permits multiple temporary engagements within the safety bound', () => {
  assert.equal(
    temporaryCapacityAllowsAcceptance({
      contractType: 'temporary',
      hasPremiumCapacity: true,
      activeTemporaryEngagementCount: 12,
    }),
    true
  )
  assert.equal(
    temporaryCapacityAllowsAcceptance({
      contractType: 'temporary',
      hasPremiumCapacity: true,
      activeTemporaryEngagementCount: 100,
    }),
    false
  )
})
