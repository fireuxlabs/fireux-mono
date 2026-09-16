import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(new URL('../runtime/menu/server/workspace-commands.ts', import.meta.url), 'utf8')
  .split('export async function renameKitchenMenu(')[1]
function harness(subscription = 'premium', duplicates = []) {
  const writes = []
  const tx = { read: async () => ({ exists: true, data: { name: 'Food', slug: 'food' } }), update: (...args) => writes.push(args) }
  const dependencies = {
    requireFirestoreDocumentId: value => value,
    menuNameAndSlug: (_, name) => ({ name, slug: name.toLowerCase().replaceAll(' ', '-') }),
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'a' }),
    runGuardedServerTransaction: async (_, run) => run(tx),
    requireKitchenMutationAuthority: async () => ({ subscription }),
    serverKitchenMenusTarget: id => `kitchens/${id}/menus`,
    createError: value => Object.assign(new Error(value.statusMessage), value),
    requireAvailableMenuSlug: async (_, kitchenId, slug, menuId) => { if (duplicates.some(id => id !== menuId)) throw new Error('duplicate') },
    serverAuditStamp: value => value,
    syncKitchenMenuDirectory: async () => {}, getRuntimeFirestore: () => ({}),
  }
  const rename = compileFunction(`${stripTypeScriptTypes(`async function renameKitchenMenu(${source}`)};return renameKitchenMenu`, Object.keys(dependencies))(...Object.values(dependencies))
  return { rename, writes }
}
test('Plus rename updates name and slug on original document without copying children', async () => {
  for (const tier of ['premium', 'business']) {
    const h = harness(tier)
    assert.deepEqual(await h.rename({}, { kitchenId: 'k', menuId: 'stable', name: 'Dinner Menu' }), { id: 'stable', slug: 'dinner-menu' })
    assert.equal(h.writes.length, 1)
    assert.equal(h.writes[0][1], 'stable')
    assert.deepEqual(h.writes[0][2], { name: 'Dinner Menu', slug: 'dinner-menu', updated: { by: 'u' } })
  }
})
test('Free rename and duplicate slug cause no writes', async () => {
  const free = harness('free')
  await assert.rejects(free.rename({}, { kitchenId: 'k', menuId: 'stable', name: 'Dinner' }), /Plus/)
  assert.equal(free.writes.length, 0)
  const duplicate = harness('premium', ['another'])
  await assert.rejects(duplicate.rename({}, { kitchenId: 'k', menuId: 'stable', name: 'Dinner' }), /duplicate/)
  assert.equal(duplicate.writes.length, 0)
})
