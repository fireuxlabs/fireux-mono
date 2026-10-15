import assert from 'node:assert/strict'
import test from 'node:test'
import {
  menuLocalDate,
  dailyMenuToday,
} from '../runtime/menu/utils/daily-menu.ts'
import { harness, menuPath, rootPath } from './helpers/menu-publication.mjs'

function dailyHarness() {
  const h = harness()
  h.records.get('apps/app/users/operator').subscription = 'premium'
  h.records.get('places/k').timezone = 'Europe/Zurich'
  h.records.get('places/k').default_currency_code = 'CHF'
  h.records.get(menuPath).schedule = 'daily'
  h.records.get(`${menuPath}/sections/s`).date = '2026-10-15'
  h.records.get(`${menuPath}/sections/s`).label = 'Lunch'
  h.records.get(`${menuPath}/sections/s/items/i`).price = 12
  return h
}

test('publishes one date atomically and preserves the stable doorway when withdrawing', async () => {
  const h = dailyHarness()
  await h.daily('2026-10-15')
  assert.deepEqual(h.records.get(menuPath).published_dates, ['2026-10-15'])
  assert.equal(h.records.get(rootPath).status, 'published')
  const source = structuredClone(h.records.get(rootPath).source)
  // Another prepared date stays private until its own publication.
  h.records.set(`${menuPath}/sections/future`, {
    date: '2026-10-16',
    label: 'Lunch',
    status: 'active',
  })
  h.records.set(`${menuPath}/sections/future/items/i`, {
    dish_id: 'dish',
    price: 15,
  })
  await h.daily('2026-10-16')
  await h.daily('2026-10-15', false)
  assert.deepEqual(h.records.get(menuPath).published_dates, ['2026-10-16'])
  assert.deepEqual(h.records.get(rootPath).source, source)
  await h.daily('2026-10-16', false)
  assert.equal(h.records.get(menuPath).status, 'published')
  assert.equal(h.records.get(rootPath).status, 'published')
  assert.deepEqual(h.records.get(menuPath).published_dates, [])
})

for (const [label, change] of [
  [
    'missing selections',
    (h) => (h.records.get(`${menuPath}/sections/s`).date = '2026-10-14'),
  ],
  [
    'empty selection',
    (h) => h.records.delete(`${menuPath}/sections/s/items/i`),
  ],
  [
    'invalid price',
    (h) => (h.records.get(`${menuPath}/sections/s/items/i`).price = '12'),
  ],
  ['missing Dish', (h) => h.records.delete('kitchens/k/dishes/dish')],
  [
    'archived Dish',
    (h) => (h.records.get('kitchens/k/dishes/dish').status = 'archived'),
  ],
  [
    'missing currency',
    (h) => delete h.records.get('places/k').default_currency_code,
  ],
  ['missing timezone', (h) => delete h.records.get('places/k').timezone],
  ['invalid timezone', (h) => (h.records.get('places/k').timezone = 'unknown')],
  ['regular Menu', (h) => (h.records.get(menuPath).schedule = 'regular')],
  ['archived Menu', (h) => (h.records.get(menuPath).status = 'archived')],
  [
    'Free account',
    (h) => (h.records.get('apps/app/users/operator').subscription = 'free'),
  ],
  ['lost membership', (h) => h.records.delete('apps/app/users/operator')],
  ['lost Kitchen access', (h) => h.records.delete('kitchen_access/operator')],
  ['failed commit', (h) => (h.state.failCommit = true)],
])
  test(`${label} cannot publish any date or doorway`, async () => {
    const h = dailyHarness()
    change(h)
    const before = structuredClone(h.records)
    await assert.rejects(h.daily('2026-10-15'))
    assert.deepEqual(h.records, before)
  })

test('impossible dates fail and concurrent dates are merged on transaction retry', async () => {
  const h = dailyHarness()
  await assert.rejects(h.daily('2026-02-30'))
  h.state.retry = (records) => {
    records.get(menuPath).published_dates = ['2026-10-16']
  }
  await h.daily('2026-10-15')
  assert.deepEqual(h.records.get(menuPath).published_dates, [
    '2026-10-15',
    '2026-10-16',
  ])
})

test('today follows Place timezone, not UTC, and never falls back to a previous date', () => {
  const menu = { published_dates: ['2026-10-15'] }
  const before = dailyMenuToday(
    menu,
    'Europe/Zurich',
    new Date('2026-10-15T21:59:59Z')
  )
  assert.equal(before.date, '2026-10-15')
  assert.equal(before.published, true)
  assert.equal(before.nextChangeAt, Date.parse('2026-10-15T22:00:00Z'))
  const after = dailyMenuToday(
    menu,
    'Europe/Zurich',
    new Date(before.nextChangeAt)
  )
  assert.equal(after.date, '2026-10-16')
  assert.equal(after.published, false)
  assert.throws(() => menuLocalDate(''))
})

test('date rollover respects both daylight-saving transitions', () => {
  for (const [start, end] of [
    ['2026-03-28T23:00:00Z', '2026-03-29T22:00:00Z'],
    ['2026-10-24T22:00:00Z', '2026-10-25T23:00:00Z'],
  ])
    assert.equal(
      dailyMenuToday({}, 'Europe/Zurich', new Date(start)).nextChangeAt,
      Date.parse(end)
    )
})

test('a current Kitchen writer can withdraw a date after downgrade or timezone loss', async () => {
  const h = dailyHarness()
  await h.daily('2026-10-15')
  h.records.get('apps/app/users/operator').subscription = 'free'
  delete h.records.get('places/k').timezone
  await h.daily('2026-10-15', false)
  assert.deepEqual(h.records.get(menuPath).published_dates, [])
  assert.equal(h.records.get(rootPath).status, 'published')
})
