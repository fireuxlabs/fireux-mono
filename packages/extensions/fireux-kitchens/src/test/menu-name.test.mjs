import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
const source = readFileSync(
  new URL('../runtime/menu/server/records/update.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
function harness(subscription = 'pro', duplicates = []) {
  const writes = []
  const tx = {
    read: async () => ({ exists: true, data: { name: 'Food', slug: 'food' } }),
    update: (...args) => writes.push(args),
  }
  const metadataSource = readFileSync(
    new URL('../runtime/menu/utils/records/metadata.ts', import.meta.url),
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
  const updateKitchenMenu = compileFunction(
    `${stripTypeScriptTypes(source)};return updateKitchenMenu`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  return { rename, writes, normalizeMenuMetadataPatch, updateKitchenMenu }
}
test('Pro rename preserves original slug and children while updating the display name', async () => {
  for (const tier of ['pro', 'business']) {
    const h = harness(tier)
    assert.deepEqual(
      await h.rename(
        {},
        { kitchenId: 'k', menuId: 'stable', name: 'Dinner Menu' }
      ),
      { id: 'stable', slug: 'food', kitchenId: 'k', menuId: 'stable' }
    )
    assert.equal(h.writes.length, 1)
    assert.equal(h.writes[0][1], 'stable')
    assert.deepEqual(h.writes[0][2], {
      name: 'Dinner Menu',
      updated: { by: 'u', appId: 'a' },
    })
  }
})
test('Free rename is denied while duplicate display names preserve stable URLs', async () => {
  const free = harness('free')
  await assert.rejects(
    free.rename({}, { kitchenId: 'k', menuId: 'stable', name: 'Dinner' }),
    /Pro/
  )
  assert.equal(free.writes.length, 0)
  const duplicate = harness('pro', ['another'])
  const result = await duplicate.rename(
    {},
    { kitchenId: 'k', menuId: 'stable', name: 'Dinner' }
  )
  assert.equal(result.slug, 'food')
  assert.equal(duplicate.writes.length, 1)
})

test('Workspace rename passes stable target to the surviving Record owner', async () => {
  const component = readFileSync(
    new URL(
      '../runtime/kitchen/composables/workspace/menus/useMenuRecordMetadata.ts',
      import.meta.url
    ),
    'utf8'
  )
  const metadataSource = component
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  const calls = [],
    destinations = []
  const context = {
    menu: ref({ name: 'Old Menu' }),
    canWrite: ref(true),
    subscription: ref('pro'),
    menuId: ref('stable-id'),
    kitchenId: ref('kitchen'),
    menuSlug: ref('old-slug'),
    renameMenu: async (...args) => {
      calls.push(args)
      return { id: 'stable-id', slug: 'new-menu-slug' }
    },
    router: { replace: async (path) => destinations.push(path) },
    toast: { add: () => {} },
  }
  const { rename } = compileFunction(
    `${stripTypeScriptTypes(metadataSource)}; return useMenuRecordMetadata(context)`,
    ['computed', 'useMenuEditorScope', 'context']
  )(computed, () => () => () => true, context)
  await rename('New Menu')
  assert.deepEqual(calls[0].slice(0, 3), ['kitchen', 'stable-id', 'New Menu'])
  assert.equal(calls[0][3](), true)
  assert.deepEqual(destinations, [])
})

test('internal name edits preserve the public name and stable route', async () => {
  const { normalizeMenuMetadataPatch, updateKitchenMenu, writes } = harness()
  assert.deepEqual(
    normalizeMenuMetadataPatch({ internal_name: ' Takeaway drinks ' }),
    { internal_name: 'Takeaway drinks' }
  )
  assert.deepEqual(normalizeMenuMetadataPatch({ internal_name: '  ' }), {
    internal_name: '',
  })
  assert.throws(() => normalizeMenuMetadataPatch({ internal_name: 42 }))
  assert.throws(() =>
    normalizeMenuMetadataPatch({ internal_name: 'a'.repeat(161) })
  )
  await updateKitchenMenu(
    {},
    {
      kitchenId: 'k',
      menuId: 'm',
      changes: { internal_name: 'Takeaway drinks' },
    }
  )
  assert.equal(writes[0][2].internal_name, 'Takeaway drinks')
  assert.ok(!Object.hasOwn(writes[0][2], 'name'))
  assert.ok(!Object.hasOwn(writes[0][2], 'slug'))
})
