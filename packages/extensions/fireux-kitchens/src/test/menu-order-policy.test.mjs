import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'

function load(name, exports, dependencies = {}) {
  const source = readFileSync(
    new URL(`../runtime/menu/server/ordering/${name}.ts`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return { ${exports} }`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const policies = load(
  'order-type',
  'menuOrderTypeStrategy, menuOrderTypeStrategiesList'
)
const { normalizeOrderType, text } = load(
  'order-request',
  'normalizeOrderType, text',
  { ...policies, createError }
)
const { readMenuOrderDestination } = load(
  'order-destination',
  'readMenuOrderDestination',
  { text, createError }
)
const destination = (type, body = {}) =>
  readMenuOrderDestination(body, policies.menuOrderTypeStrategy(type))

test('known modes still require membership in the enabled service modes', () => {
  for (const type of [
    'dine_in',
    'eat_in',
    'takeaway',
    'collection',
    'delivery',
    'pre_order',
    'room_service',
  ]) {
    assert.equal(normalizeOrderType(` ${type} `, [type]), type)
    assert.throws(
      () => normalizeOrderType(type, []),
      /Choose a valid order type/
    )
  }
  assert.throws(
    () => normalizeOrderType('unknown', ['unknown']),
    /Choose a valid order type/
  )
})

test('destination requirements stay specific to the selected mode', () => {
  assert.throws(() => destination('dine_in'), /Table is required/)
  assert.throws(() => destination('room_service'), /Room is required/)
  assert.deepEqual(destination('dine_in', { table: { number: ' 12 ' } }), {
    collection: null,
    table: { number: '12' },
  })
  assert.deepEqual(
    destination('room_service', { room_service: { room: '7' } }),
    {
      collection: null,
      roomService: { room: '7' },
    }
  )
  for (const type of ['eat_in', 'takeaway', 'delivery', 'pre_order']) {
    assert.deepEqual(destination(type), { collection: null })
    assert.throws(
      () => destination(type, { table: { number: '1' } }),
      /does not match/
    )
    assert.throws(
      () => destination(type, { room_service: { room: '1' } }),
      /does not match/
    )
  }
  assert.deepEqual(destination('collection'), { collection: { mode: 'queue' } })
  assert.throws(
    () => destination('collection', { collection: { mode: 'scheduled' } }),
    /Choose a collection time/
  )
})

test('pre-order requires future dining hours while immediate modes check current opening', () => {
  const calls = []
  const { validateMenuOrderSchedule } = load(
    'schedule',
    'validateMenuOrderSchedule',
    {
      ...policies,
      createError,
      readWeekdayTimeSelectionState: (...args) => {
        calls.push(['selection', ...args])
        return { available: true }
      },
      readWeekdayTimeNoticeState: (...args) => {
        calls.push(['notice', ...args])
        return { complete: true, available: true }
      },
      readWeekdayTimeOpenState: () => ({ known: true, open: false }),
    }
  )
  const hours = {
    windows: [{ days: ['friday'], open: '17:00', close: '22:00' }],
  }
  const base = { collection: null, orderType: 'pre_order', requestedFor: '' }
  assert.throws(
    () => validateMenuOrderSchedule(base),
    /Choose a requested date and time/
  )
  const requestedFor = '2026-09-18T18:30'
  assert.throws(
    () => validateMenuOrderSchedule({ ...base, requestedFor }),
    /Requested dining times are unavailable/
  )
  validateMenuOrderSchedule({ ...base, requestedFor, hours, noticeHours: 24 })
  assert.deepEqual(calls, [
    ['selection', hours, '2026-09-18', '18:30'],
    ['notice', hours, requestedFor, 24],
  ])
  for (const orderType of [
    'dine_in',
    'eat_in',
    'takeaway',
    'room_service',
    'delivery',
    'collection',
  ]) {
    assert.throws(
      () => validateMenuOrderSchedule({ ...base, orderType, hours }),
      /outside serving hours/
    )
  }
  calls.length = 0
  validateMenuOrderSchedule({
    ...base,
    orderType: 'delivery',
    requestedFor,
    hours,
  })
  validateMenuOrderSchedule({
    ...base,
    orderType: 'collection',
    hours,
    collection: { mode: 'scheduled', requested_for: requestedFor },
  })
  assert.equal(calls.filter(([kind]) => kind === 'notice').length, 2)
})
