import assert from 'node:assert/strict'
import test from 'node:test'
import {
  googleSignInFeedback,
  emailSignInFeedback,
} from '../runtime/components/Auth/sign-in-feedback.ts'

test('a closed Google window offers recovery without blaming the user', () => {
  const feedback = googleSignInFeedback({ code: 'auth/popup-closed-by-user' })
  assert.equal(feedback.color, 'warning')
  assert.match(feedback.description, /Try Google again/)
  assert.doesNotMatch(feedback.description, /you closed/i)
  assert.notEqual(
    feedback.title,
    googleSignInFeedback({ code: 'auth/popup-blocked' }).title
  )
})

test('displayed and copied feedback never contains raw provider data', () => {
  for (const code of [
    'auth/popup-closed-by-user',
    'auth/network-request-failed',
    'private-token',
  ]) {
    const feedback = googleSignInFeedback({
      code,
      message: 'secret-token alice@example.com',
      customData: { credential: 'private-key' },
    })
    assert.doesNotMatch(
      JSON.stringify(feedback),
      /secret-token|alice@|private-key|private-token/
    )
  }
  assert.deepEqual(
    googleSignInFeedback(new Error('secret')),
    googleSignInFeedback(null)
  )
})

test('unknown email failures do not claim whether an account exists', () => {
  for (const signUp of [false, true]) {
    const feedback = emailSignInFeedback(signUp)
    assert.doesNotMatch(feedback.title, /no account|already exist|not found/i)
    assert.match(feedback.description, /try again/)
  }
})
