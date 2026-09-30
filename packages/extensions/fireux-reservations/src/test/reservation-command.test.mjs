import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, exports, dependencies = {}) {
  const source = readFileSync(new URL(`../runtime/property/${path}`, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\s*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return {${exports}}`, Object.keys(dependencies))(...Object.values(dependencies))
}
const dates = load('utils/reservation-date.ts', 'isDateOnly')
const records = load('server/operations/reservations/records.ts', 'canonicalReservation,occupiedDates,reservationFail,reservationInput,reservationIsActive', {
  ...dates, createError: input => Object.assign(new Error(input.statusMessage), input),
})
const input = (status = 'confirmed') => ({
  guest: { display_name: 'Test guest', email: '', phone: '' }, source: 'manual', external_reference: '',
  status, arrival_date: '2026-10-01', departure_date: '2026-10-03', adults: 1, children: 0, total: null, notes: '',
})
const stamp = { at: 'test-time', by: 'operator' }
const stored = (status) => ({ ...input(status), property_id: 'property-a', sync: { state: 'local', channel_updated_at: null }, created: { ...stamp, app_id: 'app-a' }, updated: stamp })
const reservationPath = 'properties/property-a/reservations/reservation-a'
const nightPath = date => `properties/property-a/reservation-nights/${date}`
function harness(status) {
  const data = new Map()
  if (status) data.set(reservationPath, stored(status))
  const writes = []
  const ref = path => ({ path, id: path.split('/').at(-1), get: async () => snapshot(path) })
  const snapshot = path => ({ id: path.split('/').at(-1), ref: ref(path), exists: data.has(path), data: () => data.get(path), get: field => data.get(path)?.[field] })
  const db = {
    doc: ref,
    collection: path => ({ doc: () => ref(`${path}/reservation-a`) }),
    runTransaction: async run => {
      const pending = []
      const transaction = {
        get: async target => snapshot(target.path), getAll: async (...targets) => targets.map(target => snapshot(target.path)),
        create: (target, value) => { writes.push('create'); pending.push(() => data.set(target.path, value)) },
        update: (target, value) => { writes.push('update'); pending.push(() => data.set(target.path, { ...data.get(target.path), ...value })) },
        delete: target => { writes.push('delete'); pending.push(() => data.delete(target.path)) },
      }
      await run(transaction)
      pending.forEach(commit => commit())
    },
  }
  const commands = load('server/operations/reservations/command.ts', 'createReservationCommand,updateReservationCommand', {
    ...records, ReservationNightStorage: { collection: 'reservation-nights' },
    requireReservationActor: async () => ({ db, propertyId: 'property-a', uid: 'operator', appId: 'app-a' }),
    serverAuditStamp: ({ appId }) => ({ ...stamp, ...(appId ? { app_id: appId } : {}) }),
  })
  return { ...commands, data, writes }
}

for (const range of [
  { arrival_date: '2026-10-03', departure_date: '2026-10-01' },
  { arrival_date: '2026-10-01', departure_date: '2026-10-01' },
  { arrival_date: '2026-10-01', departure_date: '2027-10-03' },
]) {
  test(`cancelled create rejects invalid range before any write: ${range.departure_date}`, async () => {
    const h = harness()
    await assert.rejects(h.createReservationCommand({}, 'property-a', { ...input('cancelled'), ...range }), /after arrival|366 nights/)
    assert.deepEqual(h.writes, [])
    assert.equal(h.data.size, 0)
  })
}

test('cancelled update validates merged dates before writes, including cancellation in same patch', async () => {
  for (const status of ['cancelled', 'confirmed']) {
    for (const patch of [
      { departure_date: '2026-10-01' }, { arrival_date: '2026-10-04' }, { departure_date: '2027-10-03' },
    ]) {
      const h = harness(status)
      const before = structuredClone([...h.data])
      await assert.rejects(h.updateReservationCommand({}, 'property-a', 'reservation-a', { ...patch, status: 'cancelled' }), /after arrival|366 nights/)
      assert.deepEqual(h.writes, [])
      assert.deepEqual([...h.data], before)
    }
  }
})

test('valid cancelled create and update persist without allocating occupied nights', async () => {
  const h = harness()
  const result = await h.createReservationCommand({}, 'property-a', input('cancelled'))
  assert.equal(result.reservation.status, 'cancelled')
  assert.equal(h.data.size, 1)
  const updated = await h.updateReservationCommand({}, 'property-a', 'reservation-a', { departure_date: '2026-10-04' })
  assert.equal(updated.reservation.departure_date, '2026-10-04')
  assert.equal(h.data.size, 1)
})

test('active create locks nights; cancellation releases only owned nights; reactivation respects conflicts', async () => {
  const h = harness()
  await h.createReservationCommand({}, 'property-a', input())
  assert.equal(h.data.size, 3)
  assert.equal(h.data.get(nightPath('2026-10-01')).reservation_id, 'reservation-a')
  h.data.set(nightPath('2026-10-02'), { reservation_id: 'other' })
  await h.updateReservationCommand({}, 'property-a', 'reservation-a', { status: 'cancelled' })
  assert.equal(h.data.has(nightPath('2026-10-01')), false)
  assert.equal(h.data.get(nightPath('2026-10-02')).reservation_id, 'other')
  h.writes.length = 0
  await assert.rejects(h.updateReservationCommand({}, 'property-a', 'reservation-a', { status: 'confirmed' }), /already reserved/)
  assert.deepEqual(h.writes, [])
  h.data.delete(nightPath('2026-10-02'))
  await h.updateReservationCommand({}, 'property-a', 'reservation-a', { status: 'confirmed' })
  assert.equal(h.data.size, 3)
})

test('active date change replaces locks and conflicting create writes nothing', async () => {
  const h = harness()
  await h.createReservationCommand({}, 'property-a', input())
  await h.updateReservationCommand({}, 'property-a', 'reservation-a', { arrival_date: '2026-10-02', departure_date: '2026-10-04' })
  assert.equal(h.data.has(nightPath('2026-10-01')), false)
  assert.equal(h.data.has(nightPath('2026-10-03')), true)
  h.writes.length = 0
  await assert.rejects(h.createReservationCommand({}, 'property-a', input()), /already reserved/)
  assert.deepEqual(h.writes, [])
})
