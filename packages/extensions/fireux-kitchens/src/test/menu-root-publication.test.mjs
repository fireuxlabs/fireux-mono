import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const source = stripTypeScriptTypes(
  readFileSync(
    new URL('../runtime/menu/server/directory/root-entry.ts', import.meta.url),
    'utf8'
  )
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')

test('publishing from another App reuses the KitchenMenu doorway and archives a redundant projection', async () => {
  const records = new Map([
    [
      'baeren--drinks',
      {
        source: { app_id: 'baeren', kitchen_id: 'kitchen', menu_id: 'drinks' },
        status: 'draft',
      },
    ],
    [
      'baeren--drinks-2',
      {
        source: { app_id: 'misebox', kitchen_id: 'kitchen', menu_id: 'drinks' },
        status: 'published',
      },
    ],
  ])
  const snapshot = (id) => ({
    id,
    exists: records.has(id),
    data: () => records.get(id),
    get: (key) => records.get(id)?.[key],
  })
  const db = {
    doc: () => ({
      get: async () => ({ data: () => ({ name: 'Bären', slug: 'baeren' }) }),
    }),
    collection: () => ({
      where: () => ({
        get: async () => ({ docs: [...records.keys()].map(snapshot) }),
      }),
      doc: (id) => ({ get: async () => snapshot(id) }),
    }),
  }
  const dependencies = {
    FieldValue: { delete: () => null },
    serverCreate: () => {
      throw new Error('Must reuse the existing doorway')
    },
    serverUpdate: async (_target, id, patch) =>
      records.set(id, { ...records.get(id), ...patch }),
    readRecordString: (value, key) => String(value?.[key] || ''),
    FIRESTORE_MUTATION_TARGETS: { menus: {} },
    normalizeSlug: (value) => value.toLowerCase(),
    MenuStorage: { rootCollection: 'menus' },
    publicKitchenMenuId: (kitchen, menu) => `${kitchen}--${menu}`,
  }
  const ensure = compileFunction(
    `${source}; return ensureKitchenMenuRootEntry`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
  const input = {
    appId: 'misebox',
    kitchenId: 'kitchen',
    kitchenPath: 'kitchens/kitchen',
    menuId: 'drinks',
    menuData: { name: 'Drinks', status: 'published' },
    stamp: {},
  }
  assert.equal((await ensure(db, input)).id, 'baeren--drinks')
  assert.equal(records.get('baeren--drinks').source.app_id, 'baeren')
  assert.equal(records.get('baeren--drinks').status, 'published')
  assert.equal(records.get('baeren--drinks-2').status, 'archived')
  await ensure(db, input)
  assert.equal(records.size, 2)
})
