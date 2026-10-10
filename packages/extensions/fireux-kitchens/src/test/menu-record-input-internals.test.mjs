import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

const root = new URL('../', import.meta.url)
function load(path, dependencies, names) {
  const source = readFileSync(new URL(path, root), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export type \*[^\n]*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return {${names}}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const metadata = load(
  'runtime/menu/utils/menu-metadata.ts',
  {},
  'normalizeMenuMetadataPatch, normalizeMenuDocument'
)
const creation = load(
  'runtime/menu/utils/menu-create-input.ts',
  metadata,
  'normalizeMenuCreateInput, buildMenuPayload'
)
const optionReaders = load(
  'runtime/menu/utils/menu-item.ts',
  {},
  'normalizeMenuItemPriceOptions, normalizeMenuItemAddOns'
)
const { normalizeMenuItemPatch } = load(
  'runtime/menu/utils/menu-item-patch.ts',
  {
    ...optionReaders,
    normalizeSlug: (value) =>
      String(value)
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-'),
  },
  'normalizeMenuItemPatch'
)
const doc = {
  url: 'https://example.com/menu.pdf',
  name: 'Menu',
  type: 'application/pdf',
  storage_path: 'menus/menu.pdf',
}
const deferred = () => {
  let resolve
  const promise = new Promise((done) => {
    resolve = done
  })
  return { promise, resolve }
}
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const requireFirestoreDocumentId = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}

test('Menu creation and editing share complete typed document and description validation', () => {
  for (const invalidDoc of [
    null,
    {},
    { ...doc, name: '' },
    { ...doc, type: 3 },
    { ...doc, storage_path: {} },
    { ...doc, extra: true },
    { ...doc, url: 'javascript:alert(1)' },
    { ...doc, url: 'relative.pdf' },
  ]) {
    assert.throws(() =>
      creation.normalizeMenuCreateInput({ name: 'Lunch', doc: invalidDoc })
    )
    assert.throws(() =>
      metadata.normalizeMenuMetadataPatch({ doc: invalidDoc })
    )
  }
  for (const description of [null, 3, {}, 'x'.repeat(4001)]) {
    assert.throws(() =>
      creation.normalizeMenuCreateInput({ name: 'Lunch', description })
    )
    assert.throws(() => metadata.normalizeMenuMetadataPatch({ description }))
  }
  assert.equal(
    metadata.normalizeMenuMetadataPatch({ description: '  ' }).description,
    ''
  )
  assert.deepEqual(
    creation.normalizeMenuCreateInput({
      name: ' Lunch ',
      doc: { ...doc, name: ' Menu ' },
    }).doc,
    doc
  )
})

test('creation accepts only draft catalogue inputs and rejects caller-owned or mistyped fields', () => {
  for (const input of [
    null,
    [],
    { name: 'Lunch', status: '' },
    { name: 'Lunch', status: null },
    { name: 'Lunch', status: 'published' },
    { name: 'Lunch', schedule: null },
    { name: 'Lunch', kitchenId: {} },
    { name: 'Lunch', ordering: {} },
    { name: 'Lunch', created: {} },
    { name: 'Lunch', sort_order: 1 },
    { name: 'Lunch', slug: 'lunch' },
  ])
    assert.throws(() => creation.normalizeMenuCreateInput(input))
  const input = { kitchenId: 'k', name: 'Lunch', doc: { ...doc } }
  const value = creation.normalizeMenuCreateInput(input)
  input.doc.name = 'changed'
  assert.equal(value.doc.name, 'Menu')
})

test('explicit add-on and variant writes reject coercion into zero or incomplete terms', () => {
  for (const price of [
    undefined,
    null,
    '',
    '2',
    'bad',
    {},
    false,
    NaN,
    Infinity,
    -1,
  ])
    assert.throws(() =>
      normalizeMenuItemPatch({ add_ons: [{ label: 'Extra cheese', price }] })
    )
  for (const quantity of ['2', null, {}, -1, Infinity, NaN])
    assert.throws(() =>
      normalizeMenuItemPatch({
        price_options: [{ label: 'Large', price: 15, quantity }],
      })
    )
  for (const price of [null, '15', {}, false, NaN, Infinity, 0, -1])
    assert.throws(() =>
      normalizeMenuItemPatch({ price_options: [{ label: 'Large', price }] })
    )
  assert.throws(() =>
    normalizeMenuItemPatch({ add_ons: [{ label: 3, price: 1 }] })
  )
  assert.throws(() =>
    normalizeMenuItemPatch({
      price_options: [{ label: 'Large', price: 15, serverOwned: true }],
    })
  )
  const input = {
    add_ons: [{ id: 'cheese', label: 'Cheese', price: 0 }],
    price_options: [
      { label: 'Large', quantity: 1, unit: 'portion', price: 15 },
    ],
  }
  const value = normalizeMenuItemPatch(input)
  input.add_ons[0].price = 99
  assert.equal(value.add_ons[0].price, 0)
  assert.equal(value.price_options[0].price, 15)
})

test('trusted Menu create snapshots all metadata before actor credentials', async () => {
  const wait = deferred(),
    writes = []
  const { createKitchenMenu } = load(
    'runtime/menu/server/records/create.ts',
    {
      ...creation,
      createError,
      requireFirestoreDocumentId,
      randomUUID: () => 'm',
      menuNameAndSlug: (_, name) => ({ name, slug: name.toLowerCase() }),
      readKitchenMutationActor: () => wait.promise,
      requireMenuCreationCapacity: async () => ({
        subscription: 'premium',
        placeData: { currency: 'CHF' },
      }),
      readPlaceCurrencyCode: (value) => value.currency,
      requireAvailableMenuSlug: async () => {},
      serverAuditStamp: () => ({}),
      serverKitchenMenusTarget: (id) => `kitchens/${id}/menus`,
      runGuardedServerTransaction: async (_, run) =>
        run({ create: (...args) => writes.push(args) }),
    },
    'createKitchenMenu'
  )
  const input = {
    kitchenId: 'k',
    name: 'Lunch',
    description: 'Original',
    schedule: 'regular',
    doc: { ...doc },
  }
  const request = createKitchenMenu({}, input)
  Object.assign(input, {
    kitchenId: 'other',
    description: 'Changed',
    schedule: 'daily',
  })
  input.doc.name = 'Changed'
  wait.resolve({ uid: 'u', runtimeAppId: 'a' })
  await request
  assert.equal(writes[0][0], 'kitchens/k/menus')
  assert.equal(writes[0][2].description, 'Original')
  assert.equal(writes[0][2].doc.name, 'Menu')
  assert.equal(Object.hasOwn(writes[0][2], 'schedule'), false)
})

test('trusted item edit snapshots and validates commercial changes before actor credentials', async () => {
  const wait = deferred(),
    writes = []
  const { updateKitchenMenuItem } = load(
    'runtime/menu/server/items/write.ts',
    {
      createError,
      requireFirestoreDocumentId,
      normalizeMenuItemPatch,
      readKitchenMutationActor: () => wait.promise,
      requireKitchenMutationAuthority: async () => {},
      serverAuditStamp: () => ({}),
      serverKitchenMenusTarget: (k) => `${k}/menus`,
      serverKitchenMenuSectionsTarget: (k, m) => `${k}/menus/${m}/sections`,
      serverKitchenMenuItemsTarget: (k, m, s) =>
        `${k}/menus/${m}/sections/${s}/items`,
      runGuardedServerTransaction: async (_, run) =>
        run({
          read: async () => ({ exists: true, data: {} }),
          update: (...args) => writes.push(args),
        }),
    },
    'updateKitchenMenuItem'
  )
  const input = {
    kitchenId: 'k',
    menuId: 'm',
    sectionId: 's',
    itemId: 'i',
    changes: { price: 15, add_ons: [{ label: 'Extra', price: 1 }] },
  }
  const request = updateKitchenMenuItem({}, input)
  input.changes.price = -99
  input.changes.add_ons[0].price = 999
  input.itemId = 'other'
  wait.resolve({ uid: 'u' })
  await request
  assert.equal(writes[0][1], 'i')
  assert.equal(writes[0][2].price, 15)
  assert.equal(writes[0][2].add_ons[0].price, 1)
})
