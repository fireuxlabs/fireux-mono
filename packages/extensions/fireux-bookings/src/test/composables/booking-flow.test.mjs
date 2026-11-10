import assert from 'node:assert/strict'
import test from 'node:test'
import { effectScope, ref } from 'vue'
import { useBookingFlow } from '../../runtime/composables/useBookingFlow.ts'

const slot = {
  id: 'one',
  startAt: '2030-06-15T09:00',
  endAt: '2030-06-15T10:00',
}
function harness(confirm) {
  const configuration = ref({ title: 'Sample', slots: [{ ...slot }] })
  const scope = effectScope()
  const flow = scope.run(() =>
    useBookingFlow(
      () => configuration.value,
      () => confirm
    )
  )
  return { flow, configuration, stop: () => scope.stop() }
}
function review(flow) {
  flow.selectTime('one')
  flow.next()
  flow.updateContact({ name: ' Sample Guest ', email: 'guest@example.test' })
  flow.next()
  assert.equal(flow.step.value, 2)
}

test('only offered valid times and valid contact details can progress', () => {
  const { flow, configuration, stop } = harness(async () => ({
    reference: 'one',
  }))
  flow.next()
  assert.equal(flow.step.value, 0)
  configuration.value.slots.push({
    ...slot,
    id: 'invalid',
    endAt: slot.startAt,
  })
  flow.selectTime('invalid')
  flow.next()
  assert.equal(flow.step.value, 0)
  flow.selectTime('one')
  flow.next()
  flow.updateContact({ name: 'Guest', email: 'invalid' })
  flow.next()
  assert.equal(flow.step.value, 1)
  flow.updateContact({ name: 'Guest', email: 'guest@example.test' })
  flow.next()
  assert.equal(flow.step.value, 2)
  stop()
})

test('confirmation uses a snapshot, prevents duplicate submission and retains the receipt', async () => {
  let finish
  const calls = []
  const { flow, stop } = harness((submission) => {
    calls.push(submission)
    return new Promise((resolve) => {
      finish = resolve
    })
  })
  review(flow)
  const pending = flow.submit()
  await flow.submit()
  flow.back()
  assert.equal(calls.length, 1)
  assert.equal(flow.step.value, 2)
  assert.equal(calls[0].contact.name, 'Sample Guest')
  // A host cannot mutate the customer-facing confirmation by mutating its payload.
  calls[0].contact.name = 'Changed by adapter'
  finish({ reference: 'REF-001' })
  await pending
  assert.equal(flow.step.value, 3)
  assert.equal(flow.confirmed.value.contact.name, 'Sample Guest')
  assert.equal(flow.confirmed.value.receipt.reference, 'REF-001')
  stop()
})

test('a failed confirmation retains review and uses the same request key on retry', async () => {
  const keys = []
  const { flow, stop } = harness(async (submission) => {
    keys.push(submission.requestId)
    if (keys.length === 1) throw new Error('This time was just taken.')
    return { reference: 'REF-002' }
  })
  review(flow)
  await flow.submit()
  assert.equal(flow.step.value, 2)
  assert.equal(flow.error.value, 'This time was just taken.')
  assert.equal(flow.pending.value, false)
  await flow.submit()
  assert.equal(keys[0], keys[1])
  assert.equal(flow.step.value, 3)
  stop()
})

test('configuration changes invalidate selection and ignore an old completion', async () => {
  let finish
  const { flow, configuration, stop } = harness(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  review(flow)
  const pending = flow.submit()
  configuration.value.title = 'A different offer'
  assert.equal(flow.step.value, 0)
  assert.equal(flow.slotId.value, '')
  assert.deepEqual(flow.contact.value, { name: '', email: '' })
  finish({ reference: 'OBSOLETE' })
  await pending
  assert.equal(flow.confirmed.value, null)
  assert.equal(flow.pending.value, false)
  stop()
})

test('disposing the surface ignores a pending completion', async () => {
  let finish
  const { flow, stop } = harness(
    () =>
      new Promise((resolve) => {
        finish = resolve
      })
  )
  review(flow)
  const pending = flow.submit()
  stop()
  finish({ reference: 'OBSOLETE' })
  await pending
  assert.equal(flow.confirmed.value, null)
})
