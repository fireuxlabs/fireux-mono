import assert from 'node:assert/strict'
import test from 'node:test'
import { workspaceLandingState } from '../runtime/composables/fireux/workspace/workspace-outcome.ts'

const empty = {
  outcome: 'empty',
  accountPending: false,
  accountError: false,
  associationCount: 0,
  recordCount: 0,
  selectedId: '',
}
test('settled guest and signed-in empty account get the getting-started view', () => {
  assert.equal(workspaceLandingState(empty), 'empty')
})
test('loading and failed accounts never appear to be new empty workspaces', () => {
  assert.equal(
    workspaceLandingState({ ...empty, accountPending: true }),
    'pending'
  )
  assert.equal(
    workspaceLandingState({ ...empty, outcome: 'pending' }),
    'pending'
  )
  assert.equal(workspaceLandingState({ ...empty, accountError: true }), 'error')
})
test('retained memberships with missing documents cannot open the empty onboarding view', () => {
  assert.equal(
    workspaceLandingState({ ...empty, associationCount: 2 }),
    'missing'
  )
})
test('one and multiple records require a resolved selection before showing management', () => {
  for (const count of [1, 5]) {
    const state = {
      ...empty,
      outcome: 'ready',
      associationCount: count,
      recordCount: count,
    }
    assert.equal(workspaceLandingState(state), 'pending')
    assert.equal(
      workspaceLandingState({ ...state, selectedId: 'one' }),
      'ready'
    )
  }
})

test('a failed prerequisite wins over another pending or idle prerequisite', () => {
  for (const outcome of ['pending', 'idle', 'ready']) {
    assert.equal(
      workspaceLandingState({
        ...empty,
        outcome,
        accountPending: true,
        accountError: true,
      }),
      'error'
    )
  }
  assert.equal(
    workspaceLandingState({ ...empty, outcome: 'error', accountPending: true }),
    'error'
  )
})
