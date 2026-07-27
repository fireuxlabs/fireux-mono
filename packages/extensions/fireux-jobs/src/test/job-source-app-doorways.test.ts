import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeFireuxJobSourceAppDoorways } from '../config/jobs.config.ts'

test('normalizes trusted HTTPS source-App doorways', () => {
  assert.deepEqual(
    normalizeFireuxJobSourceAppDoorways({
      'interlaken-essen': {
        label: 'Apply with Interlaken Essen',
        url: 'https://interlaken-essen.misebox.app/',
      },
    }),
    {
      'interlaken-essen': {
        label: 'Apply with Interlaken Essen',
        url: 'https://interlaken-essen.misebox.app',
      },
    }
  )
})

test('rejects unsafe or malformed source-App doorways', () => {
  assert.deepEqual(
    normalizeFireuxJobSourceAppDoorways({
      'bad/app': {
        label: 'Bad',
        url: 'https://example.com',
      },
      insecure: {
        label: 'Insecure',
        url: 'http://example.com',
      },
      credentials: {
        label: 'Credentials',
        url: 'https://user:password@example.com',
      },
      empty: {
        label: '',
        url: 'https://example.com',
      },
    }),
    {}
  )
})
