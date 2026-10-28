import assert from 'node:assert/strict'
import test from 'node:test'
import { withBuildVersion } from '../runtime/utils/build-version-url.ts'
import { formatFirestoreTimestamp } from '../runtime/utils/firestore-timestamp.ts'

test('version URLs encode malformed Unicode without losing existing query or fragment', () => {
  const value = withBuildVersion('/icon.png?size=2#brand', 'build\ud800')
  const url = new URL(value, 'https://fireux.test')
  assert.equal(url.searchParams.get('v'), 'build\ufffd')
  assert.equal(url.searchParams.get('size'), '2')
  assert.equal(url.hash, '#brand')
  assert.equal(withBuildVersion('/icon.png#brand', ''), '/icon.png#brand')
})

test('invalid timestamp representations return the declared fallback', () => {
  for (const value of [
    new Date(NaN),
    { seconds: Infinity },
    { seconds: NaN },
    { _seconds: Infinity },
    'invalid',
    null,
  ]) {
    assert.equal(
      formatFirestoreTimestamp(value, { fallback: 'Unavailable' }),
      'Unavailable'
    )
  }
})

test('supported timestamp representations resolve the same instant', () => {
  const options = {
    locale: 'en-GB',
    format: {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
  }
  const instant = Date.UTC(2026, 0, 2)
  const expected = formatFirestoreTimestamp(new Date(instant), options)
  for (const value of [
    instant,
    new Date(instant).toISOString(),
    { seconds: instant / 1000 },
    { _seconds: instant / 1000 },
    { toDate: () => new Date(instant) },
  ]) {
    assert.equal(formatFirestoreTimestamp(value, options), expected)
  }
})
