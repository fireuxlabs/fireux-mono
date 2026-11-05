import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = readFileSync(new URL('../runtime/server/booking.ts', import.meta.url), 'utf8').replace(/^export /gm, '')
const { confirmBooking, BookingError } = compileFunction(`${stripTypeScriptTypes(source)}; return { confirmBooking, BookingError }`)()

function harness(overrides = {}) {
  const calls = []
  const lifecycle = {
    reserve: async (record) => { calls.push(['reserve', record]) },
    verify: async (record) => { calls.push(['verify', record]) },
    createEffect: async (record) => { calls.push(['effect', record]); return { id: 'provider-1' } },
    confirm: async (record, effect) => { calls.push(['confirm', record, effect]) },
    release: async (record) => { calls.push(['release', record]) },
    ...overrides,
  }
  return { calls, lifecycle }
}

test('a non-tour appointment uses the same lifecycle without Google or App dependencies', async () => {
  const record = { id: 'appointment-1', resource: 'consultation-room', start: '2026-12-01T10:00:00Z' }
  const h = harness()
  assert.deepEqual(await confirmBooking(record, h.lifecycle), { id: 'provider-1' })
  assert.deepEqual(h.calls.map(([name]) => name), ['reserve', 'verify', 'effect', 'confirm'])
  assert.equal(h.calls[0][1], record)
  assert.deepEqual(h.calls[3][2], { id: 'provider-1' })
})

test('an atomic reservation conflict never invokes the provider or cleanup', async () => {
  const conflict = new BookingError(409, 'occupied', 'Occupied')
  const h = harness({ reserve: async () => { throw conflict } })
  await assert.rejects(confirmBooking({}, h.lifecycle), (error) => error === conflict)
  assert.deepEqual(h.calls, [])
})

test('a conflict before the provider effect releases capacity and preserves the domain error', async () => {
  const conflict = new BookingError(409, 'occupied', 'Occupied')
  const h = harness({ verify: async () => { throw conflict } })
  await assert.rejects(confirmBooking({}, h.lifecycle), (error) => error === conflict)
  assert.deepEqual(h.calls.map(([name]) => name), ['reserve', 'release'])
})

for (const stage of ['createEffect', 'confirm']) {
  test(`${stage} failure keeps capacity held and hides provider details`, async () => {
    const h = harness({ [stage]: async () => { throw new Error('private provider response') } })
    await assert.rejects(confirmBooking({}, h.lifecycle), (error) =>
      error.statusCode === 503 && error.code === 'booking_reconciliation_required' && !error.message.includes('private'))
    assert.equal(h.calls.some(([name]) => name === 'release'), false)
  })
}

test('cleanup failure does not replace the original availability conflict', async () => {
  const conflict = new BookingError(409, 'occupied', 'Occupied')
  const h = harness({ verify: async () => { throw conflict }, release: async () => { throw new Error('storage unavailable') } })
  await assert.rejects(confirmBooking({}, h.lifecycle), (error) => error === conflict)
})
