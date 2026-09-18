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
