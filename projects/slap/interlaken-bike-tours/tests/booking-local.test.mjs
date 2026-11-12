import assert from 'node:assert/strict'
import test from 'node:test'
import { createLocalTourBookingWorkflow } from '../server/utils/tour-booking-local.ts'

const input = {
  tourSlug: 'interlaken-panorama',
  date: '2099-06-15',
  guestName: 'Test Guest',
  guestEmail: 'guest@example.test',
  groupSize: 3,
  availabilityRevision: 0,
}

test('local adapters complete the real workflow and close the booked date', async () => {
  const workflow = createLocalTourBookingWorkflow()
  assert.equal((await workflow.checkAvailability(input)).available, true)
  const { booking } = await workflow.book(input)
  assert.equal(booking.status, 'confirmed')
  assert.equal(booking.totalPriceChf, 477)
  assert.match(booking.id, /^local-/)
  assert.equal((await workflow.checkAvailability(input)).reason, 'booked')
  await assert.rejects(
    workflow.book(input),
    (error) => error.statusCode === 409
  )
})

test('concurrent requests cannot reserve the same local date twice', async () => {
  const workflow = createLocalTourBookingWorkflow()
  const results = await Promise.allSettled([
    workflow.book(input),
    workflow.book(input),
  ])
  assert.equal(
    results.filter((result) => result.status === 'fulfilled').length,
    1
  )
})

test('local adapters retain real guest validation', async () => {
  const workflow = createLocalTourBookingWorkflow()
  await assert.rejects(
    workflow.book({ ...input, groupSize: 0 }),
    (error) => error.statusCode === 400
  )
  assert.equal((await workflow.checkAvailability(input)).available, true)
})
