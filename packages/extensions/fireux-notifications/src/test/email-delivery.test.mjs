import test from 'node:test'
import assert from 'node:assert/strict'
import {
  createEmailDelivery,
  captureEmail,
  EmailRejected,
} from '../runtime/utils/email-delivery.ts'
const message = {
  id: 'one',
  from: 'sender@example.test',
  to: 'recipient@example.test',
  subject: 'Confirmation',
  text: 'Confirmed.',
}

test('capture is explicit and duplicate submissions share one attempt', async () => {
  let calls = 0
  const ledger = createEmailDelivery(async () => {
    calls++
    return captureEmail(message)
  })
  const results = await Promise.all([
    ledger.send(message),
    ledger.send(message),
  ])
  assert.equal(calls, 1)
  assert.equal(results[0].status, 'captured')
  assert.equal((await ledger.send(message)).attempts, 1)
  assert.throws(() => ledger.send({ ...message, text: 'Changed' }))
})

test('only a definite rejection can be explicitly retried', async () => {
  let calls = 0
  const ledger = createEmailDelivery(async () => {
    if (++calls === 1) throw new EmailRejected('Rejected')
    return { status: 'sent', providerId: 'provider-id' }
  })
  assert.equal((await ledger.send(message)).status, 'failed')
  assert.equal((await ledger.send(message)).attempts, 1)
  assert.equal((await ledger.send(message, true)).status, 'sent')
  assert.equal(calls, 2)
})

test('uncertain transport errors never resend automatically or on retry', async () => {
  let calls = 0
  const ledger = createEmailDelivery(async () => {
    calls++
    throw new Error('Disconnected')
  })
  assert.equal((await ledger.send(message)).status, 'unknown')
  assert.equal((await ledger.send(message, true)).status, 'unknown')
  assert.equal(calls, 1)
})

test('invalid addresses and header injection never reach transport', () => {
  const ledger = createEmailDelivery(() => assert.fail('must not send'))
  assert.throws(() => ledger.send({ ...message, to: 'invalid' }))
  assert.throws(() =>
    ledger.send({ ...message, subject: 'Hello\r\nBcc: other@example.test' })
  )
})

test('callers cannot mutate delivery records', async () => {
  const ledger = createEmailDelivery(captureEmail)
  const result = await ledger.send(message)
  result.message.to = 'changed@example.test'
  assert.equal(ledger.list()[0].message.to, message.to)
})
