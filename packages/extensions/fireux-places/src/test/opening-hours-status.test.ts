import assert from 'node:assert/strict'
import test from 'node:test'
import { readOpeningHoursStatus } from '../runtime/place/utils/opening-hours-status.ts'

const hours = {
  windows: [{ days: ['friday'] as const, open: '16:00', close: '00:30' }],
}
const status = (at: string, value: any = hours) =>
  readOpeningHoursStatus(value, 'Europe/Zurich', new Date(at))
test('venue timezone controls opening and closing boundaries', () => {
  assert.equal(status('2026-09-18T13:59:00Z').open, false)
  assert.equal(status('2026-09-18T13:59:00Z').next, 'today at 16:00')
  assert.equal(status('2026-09-18T14:00:00Z').open, true)
  assert.equal(status('2026-09-18T22:29:00Z').open, true)
  assert.equal(status('2026-09-18T22:30:00Z').open, false)
  assert.equal(status('2026-09-18T14:00:00Z').closes, 'tomorrow at 00:30')
})
test('split shifts and week rollover find the next opening', () => {
  const split = {
    windows: [
      { days: ['friday'], open: '12:00', close: '14:00' },
      { days: ['friday'], open: '18:00', close: '22:00' },
    ],
  }
  assert.equal(status('2026-09-18T13:00:00Z', split).next, 'today at 18:00')
  assert.equal(status('2026-09-20T13:00:00Z').next, 'Friday at 16:00')
})
test('missing hours and invalid timezone do not assert closed', () => {
  assert.equal(readOpeningHoursStatus(undefined, 'Europe/Zurich').known, false)
  assert.equal(readOpeningHoursStatus(hours as any, '').known, false)
  assert.equal(
    readOpeningHoursStatus(hours as any, 'bad/timezone').known,
    false
  )
})
test('adjacent shifts merge, and 24 hour days do not falsely close at midnight', () => {
  const windows = [
    { days: ['friday'], open: '12:00', close: '16:00' },
    { days: ['friday'], open: '16:00', close: '22:00' },
  ]
  assert.equal(
    status('2026-09-18T12:00:00Z', { windows }).closes,
    'today at 22:00'
  )
  const daily = {
    windows: [
      {
        days: [
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday',
        ],
        open: '00:00',
        close: '00:00',
      },
    ],
  }
  assert.equal(status('2026-09-18T22:00:00Z', daily).open, true)
  assert.equal(status('2026-09-18T22:00:00Z', daily).closes, '')
})
test('DST changes are evaluated using local clock time', () => {
  const sunday = {
    windows: [{ days: ['sunday'], open: '01:00', close: '04:00' }],
  }
  assert.equal(status('2026-10-25T00:30:00Z', sunday).open, true)
  assert.equal(status('2026-10-25T01:30:00Z', sunday).open, true)
  assert.equal(status('2026-10-25T03:00:00Z', sunday).open, false)
})

test('split-day status keeps the reopening and complete day visible at exact boundaries', () => {
  const split = { windows: [
    { days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], open: '08:00', close: '13:00' },
    { days: ['tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], open: '16:00', close: '23:00' },
    { days: ['sunday'], open: '12:00', close: '21:00' },
  ] }
  for (const [time, open, closes, nextToday] of [
    ['05:59', false, '', true],
    ['06:00', true, 'today at 13:00', true],
    ['10:59', true, 'today at 13:00', true],
    ['11:00', false, '', true],
    ['13:59', false, '', true],
    ['14:00', true, 'today at 23:00', false],
    ['20:59', true, 'today at 23:00', false],
    ['21:00', false, '', false],
  ] as const) {
    const result = status(`2026-09-18T${time}:00Z`, split)
    assert.equal(result.open, open, time)
    assert.equal(result.closes, closes, time)
    assert.equal(result.nextToday, nextToday, time)
    assert.deepEqual(result.todayHours, ['08:00–13:00', '16:00–23:00'])
  }
  assert.equal(status('2026-09-18T11:00:00Z', split).next, 'today at 16:00')
  const monday = status('2026-09-21T10:00:00Z', split)
  assert.equal(monday.open, false)
  assert.equal(monday.next, 'tomorrow at 08:00')
  assert.equal(monday.nextToday, false)
  assert.deepEqual(monday.todayHours, [])
})

test('today hours clip overnight carry and merge continuous openings', () => {
  assert.deepEqual(status('2026-09-18T15:00:00Z').todayHours, ['16:00–24:00'])
  assert.deepEqual(status('2026-09-18T22:15:00Z').todayHours, ['00:00–00:30'])
  const adjacent = { windows: [
    { days: ['friday'], open: '08:00', close: '13:00' },
    { days: ['friday'], open: '13:00', close: '23:00' },
  ] }
  const result = status('2026-09-18T10:00:00Z', adjacent)
  assert.deepEqual(result.todayHours, ['08:00–23:00'])
  assert.equal(result.nextToday, false)
})
