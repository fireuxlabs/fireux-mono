import assert from 'node:assert/strict'
import test from 'node:test'
import { completeKitchenMenuPublication } from '../../menu/server/publication/run.ts'

test('publishing a scoped KitchenMenu ensures its missing root projection', async () => {
  const calls: string[] = []
  const root = await completeKitchenMenuPublication({
    updateScopedMenu: async () => { calls.push('scoped') },
    ensureRootEntry: async () => {
      calls.push('root')
      return { id: 'friiites', path: '/menus/friiites' }
    },
  })

  assert.deepEqual(calls, ['scoped', 'root'])
  assert.deepEqual(root, { id: 'friiites', path: '/menus/friiites' })
})
