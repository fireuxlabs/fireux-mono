import assert from 'node:assert/strict'
import test from 'node:test'
import { userDisplayNameSeed } from '../runtime/user/utils/display-name-seed.ts'

test('initial public names prefer explicit names and never copy a full email address', () => {
  const input = {
    displayName: '  Kitchen Operator  ',
    email: 'private@example.test',
  }
  assert.equal(userDisplayNameSeed(input), 'Kitchen Operator')
  assert.equal(input.displayName, '  Kitchen Operator  ')
  assert.equal(
    userDisplayNameSeed({ displayName: ' operator@example.test ' }),
    'operator'
  )
  assert.equal(
    userDisplayNameSeed({ email: ' fallback@example.test ' }),
    'fallback'
  )
})

test('anonymous names have a bounded UID fallback while missing signed-in names remain empty', () => {
  assert.equal(
    userDisplayNameSeed({ uid: 'abcdef123456', isAnonymous: true }),
    'Guest abcdef'
  )
  assert.equal(userDisplayNameSeed({ uid: 'abcdef123456' }), '')
  assert.equal(userDisplayNameSeed({ isAnonymous: true }), '')
  assert.equal(userDisplayNameSeed({}), '')
})
