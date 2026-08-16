import assert from 'node:assert/strict'
import test from 'node:test'
import {
  menuMediaReviewKey,
  normalizeMenuMediaReview,
} from '../../server/menu/media/review'

test('menu media review keeps only bounded item decisions', () => {
  assert.deepEqual(
    normalizeMenuMediaReview({
      '0:1': { action: 'keep', candidate_url: 'https://example.com/a.png' },
      '1:0': { action: 'generate', candidate_url: '' },
      invalid: { action: 'none' },
      '2:0': { action: 'publish' },
    }),
    {
      '0:1': { action: 'keep', candidate_url: 'https://example.com/a.png' },
      '1:0': { action: 'generate', candidate_url: '' },
    }
  )
})

test('menu media review uses the stable section and item position key', () => {
  assert.equal(menuMediaReviewKey(3, 7), '3:7')
})
