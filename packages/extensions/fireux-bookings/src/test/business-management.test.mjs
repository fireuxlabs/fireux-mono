import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
function load(file, exports, scope = {}) {
  const source = readFileSync(new URL(file, import.meta.url), 'utf8').replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return { ${exports} }`, Object.keys(scope))(...Object.values(scope))
}
const policy = load('../runtime/utils/availability.ts', 'defaultBookingAvailability, readBookingAvailability, isBookingDayOpen')
const { BookingError } = load('../runtime/server/booking.ts', 'BookingError')
const targets = (id) => ({ bookings: { collectionPath: `businesses/${id}/bookings` }, locks: { collectionPath: `businesses/${id}/booking-locks` }, settings: { collectionPath: `businesses/${id}/booking-settings` } })
function harness() {
  const docs = new Map([['businesses/ben', {}], ['businesses/other', {}]])
  const writes = []
  let allowed = 'ben'
  const runGuardedServerTransaction = async (_scope, run) => {
    const pending = []
    const tx = {
      read: async (target, id) => ({ exists: docs.has(`${target.collectionPath}/${id}`), data: docs.get(`${target.collectionPath}/${id}`) }),
      readAll: async (target, limit, afterId) => [...docs].filter(([path]) => path.startsWith(target.collectionPath + '/') && path.split('/').at(-1) > (afterId || '')).sort(([a], [b]) => a.localeCompare(b)).slice(0, limit).map(([path, data]) => ({ id: path.split('/').at(-1), data })),
      create: (target, id, value) => pending.push(() => { writes.push(`${target.collectionPath}/${id}`); docs.set(`${target.collectionPath}/${id}`, value) }),
      update: (target, id, value) => pending.push(() => { writes.push(`${target.collectionPath}/${id}`); docs.set(`${target.collectionPath}/${id}`, { ...docs.get(`${target.collectionPath}/${id}`), ...value }) }),
      delete: (target, id) => pending.push(() => docs.delete(`${target.collectionPath}/${id}`)),
    }
    const result = await run(tx)
    pending.forEach((write) => write())
    return result
  }
  const scope = {
    ...policy, BookingError, businessBookingTargets: targets, runGuardedServerTransaction,
    getRuntimeFirestore: () => ({ collection: (path) => ({ doc: (id) => ({ get: async () => ({ exists: docs.has(`${path}/${id}`) }) }) }) }),
    BUSINESS_MUTATION_TARGETS: { businesses: { collectionPath: 'businesses' } },
    createError: ({ statusCode, statusMessage }) => Object.assign(new Error(statusMessage), { statusCode }),
    requireFirestoreDocumentId: (id) => { assert.equal(typeof id, 'string'); assert.ok(id && !id.includes('/')); return id },
    readBusinessMutationActor: async () => ({ uid: 'ben-user' }),
    requireBusinessMutationAuthority: async (_tx, _actor, id) => { if (id !== allowed) throw Object.assign(new Error('Forbidden'), { statusCode: 403 }) },
  }
  const store = load('../runtime/server/business/store.ts', 'createBusinessBookingStore', scope).createBusinessBookingStore('ben')
  const management = load('../runtime/server/business/management.ts', 'readBusinessBookings, updateBusinessBookingAvailability', scope)
  return { docs, writes, store, management, revoke: () => { allowed = '' } }
}
const booking = { id: 'reservation', service_id: 'ride', service_name: 'Ride', date: '2026-11-06', start_at: '2026-11-06T09:00:00+01:00', end_at: '2026-11-06T13:00:00+01:00', party_size: 2, unit_price: 159, total_price: 318, currency: 'CHF', guest_name: 'Guest', guest_email: 'guest@example.test', status: 'pending', created_at: '2026-11-05' }

test('closed dates, weekdays and time are validated with bounded inputs', () => {
  const value = { ...policy.defaultBookingAvailability(), closedDates: ['2026-11-06'] }
  assert.equal(policy.isBookingDayOpen(value, booking.date), false)
  for (const patch of [{ closedDates: ['2026-02-30'] }, { openWeekdays: [8] }, { departureTime: '25:00' }, { revision: -1 }]) assert.throws(() => policy.readBookingAvailability({ ...value, ...patch }))
})
test('saving a closed day blocks a reservation and rejects an outdated settings revision', async () => {
  const h = harness()
  const availability = { ...policy.defaultBookingAvailability(), closedDates: [booking.date] }
  await h.management.updateBusinessBookingAvailability({}, { businessId: 'ben', availability })
  await assert.rejects(h.store.reserve(booking.date, booking, 0), (error) => error.statusCode === 409)
  await assert.rejects(h.management.updateBusinessBookingAvailability({}, { businessId: 'ben', availability }), (error) => error.statusCode === 409)
  assert.equal(h.docs.has('businesses/ben/bookings/reservation'), false)
})
test('closing a date preserves an existing booking, and the operator sees its private guest details', async () => {
  const h = harness()
  await h.store.reserve(booking.date, booking, 0)
  await h.store.confirm(booking.date, booking.id, 'calendar-event')
  await h.management.updateBusinessBookingAvailability({}, { businessId: 'ben', availability: { ...policy.defaultBookingAvailability(), closedDates: [booking.date] } })
  const result = await h.management.readBusinessBookings({}, 'ben')
  assert.equal(result.bookings[0].status, 'confirmed')
  assert.equal(result.bookings[0].guest_email, booking.guest_email)
  assert.equal(h.docs.get('businesses/ben/bookings/reservation').id, undefined)
})
test('another Business and revoked membership cannot read or change availability', async () => {
  const h = harness()
  await assert.rejects(h.management.readBusinessBookings({}, 'other'), (error) => error.statusCode === 403)
  h.revoke()
  await assert.rejects(h.management.updateBusinessBookingAvailability({}, { businessId: 'ben', availability: policy.defaultBookingAvailability() }), (error) => error.statusCode === 403)
  assert.equal(h.writes.length, 0)
})
test('booking pages expose a stable cursor and never mix another Business records', async () => {
  const h = harness()
  for (let n = 0; n < 102; n++) h.docs.set(`businesses/ben/bookings/${String(n).padStart(3, '0')}`, { ...booking, service_name: 'Ben' })
  h.docs.set('businesses/other/bookings/private', { ...booking, service_name: 'Other' })
  const first = await h.management.readBusinessBookings({}, 'ben')
  const next = await h.management.readBusinessBookings({}, 'ben', first.nextCursor)
  assert.equal(first.bookings.length, 100)
  assert.equal(next.bookings.length, 2)
  assert.ok([...first.bookings, ...next.bookings].every((item) => item.service_name === 'Ben'))
})
