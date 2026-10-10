import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/menu/server/records/update.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
function harness(subscription = 'premium', duplicates = []) {
  const writes = []
  const tx = {
    read: async () => ({ exists: true, data: { name: 'Food', slug: 'food' } }),
    update: (...args) => writes.push(args),
  }
  const metadataSource = readFileSync(
    new URL('../runtime/menu/utils/menu-metadata.ts', import.meta.url),
    'utf8'
  )
    .replace(/^import[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  const normalizeMenuMetadataPatch = compileFunction(
    `${stripTypeScriptTypes(metadataSource)}; return normalizeMenuMetadataPatch`
  )()
  const dependencies = {
    normalizeMenuMetadataPatch,
    requireFirestoreDocumentId: (value) => value,
    menuNameAndSlug: (_, name) => ({
      name,
      slug: name.toLowerCase().replaceAll(' ', '-'),
    }),
    readKitchenMutationActor: async () => ({ uid: 'u', runtimeAppId: 'a' }),
    runGuardedServerTransaction: async (_, run) => run(tx),
    requireKitchenMutationAuthority: async () => ({ subscription }),
    serverKitchenMenusTarget: (id) => `kitchens/${id}/menus`,
    createError: (value) =>
      Object.assign(new Error(value.statusMessage), value),
    requireAvailableMenuSlug: async (_, kitchenId, slug, menuId) => {
      if (duplicates.some((id) => id !== menuId)) throw new Error('duplicate')
    },
    serverAuditStamp: (value) => value,
    ensureKitchenMenuRootEntry: async () => {},
    getRuntimeFirestore: () => ({}),
  }
  const rename = compileFunction(
    `${stripTypeScriptTypes(source)};return renameKitchenMenu`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { rename, writes }
}
test('Plus rename updates name and slug on original document without copying children', async () => {
  for (const tier of ['premium', 'business']) {
    const h = harness(tier)
    assert.deepEqual(
      await h.rename(
        {},
        { kitchenId: 'k', menuId: 'stable', name: 'Dinner Menu' }
      ),
      { id: 'stable', slug: 'dinner-menu', kitchenId: 'k', menuId: 'stable' }
    )
    assert.equal(h.writes.length, 1)
    assert.equal(h.writes[0][1], 'stable')
    assert.deepEqual(h.writes[0][2], {
      name: 'Dinner Menu',
      slug: 'dinner-menu',
      updated: { by: 'u', appId: 'a' },
    })
  }
})
test('Free rename and duplicate slug cause no writes', async () => {
  const free = harness('free')
  await assert.rejects(
    free.rename({}, { kitchenId: 'k', menuId: 'stable', name: 'Dinner' }),
    /Plus/
  )
  assert.equal(free.writes.length, 0)
  const duplicate = harness('premium', ['another'])
  await assert.rejects(
    duplicate.rename({}, { kitchenId: 'k', menuId: 'stable', name: 'Dinner' }),
    /duplicate/
  )
  assert.equal(duplicate.writes.length, 0)
})

test('Workspace rename passes stable target to the surviving Record owner', async () => {
  const component = readFileSync(
    new URL(
      '../runtime/kitchen/components/Workspace/Menus/Edit/Details.vue',
      import.meta.url
    ),
    'utf8'
  )
  const renameSource = component.match(
    /async function rename\(name: string\)[\s\S]*?(?=\nasync function updateDescription)/
  )[0]
  const calls = [],
    destinations = []
  const context = {
    captureScope: () => () => true,
    canRename: { value: true },
    menuId: { value: 'stable-id' },
    kitchenId: { value: 'kitchen' },
    menuSlug: { value: 'old-slug' },
    renameMenu: async (...args) => {
      calls.push(args)
      return { id: 'stable-id', slug: 'new-menu-slug' }
    },
    router: { replace: async (path) => destinations.push(path) },
    toast: { add: () => {} },
  }
  const rename = compileFunction(
    `${stripTypeScriptTypes(renameSource)}; return rename`,
    Object.keys(context)
  )(...Object.values(context))
  await rename('New Menu')
  assert.deepEqual(calls, [['kitchen', 'stable-id', 'New Menu']])
  assert.deepEqual(destinations, [])
})
