import assert from 'node:assert/strict'
import test from 'node:test'
import { shouldEmbedMenuSpecials } from '../../utils/menu-specials.ts'

test('specials embed only into the explicitly configured primary Menu', () => {
  assert.equal(shouldEmbedMenuSpecials({
    sourceMenuId: 'main',
    primaryMenuId: 'main',
    specialsEnabled: true,
    specialsMenuId: 'specials',
  }), true)
  assert.equal(shouldEmbedMenuSpecials({
    sourceMenuId: 'lunch',
    primaryMenuId: 'main',
    specialsEnabled: true,
    specialsMenuId: 'specials',
  }), false)
  assert.equal(shouldEmbedMenuSpecials({
    sourceMenuId: 'main',
    primaryMenuId: 'main',
    specialsEnabled: false,
    specialsMenuId: 'specials',
  }), false)
})
