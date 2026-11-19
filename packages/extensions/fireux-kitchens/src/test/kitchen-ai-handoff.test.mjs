import assert from 'node:assert/strict'
import test from 'node:test'
import { currentKitchenAIHandoff } from '../runtime/kitchen/utils/ai-handoff.ts'

const record = {
  userId: 'user',
  kitchenId: 'kitchen',
  capability: 'menus',
  prompt: 'Open Create Menu',
  createdAt: Date.now(),
}

test('handoff rejects another user, kitchen, expired and invalid timestamps', () => {
  const now = Date.now(),
    valid = { ...record, createdAt: now }
  assert.equal(currentKitchenAIHandoff(valid, 'user', 'kitchen', now), valid)
  for (const value of [
    { ...valid, userId: 'other' },
    { ...valid, kitchenId: 'other' },
    { ...valid, createdAt: now - 120001 },
    { ...valid, createdAt: NaN },
    { ...valid, createdAt: now + 1 },
  ]) {
    assert.equal(currentKitchenAIHandoff(value, 'user', 'kitchen', now), null)
  }
})
