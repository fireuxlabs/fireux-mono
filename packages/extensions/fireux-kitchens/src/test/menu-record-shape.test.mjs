import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, symbol, dependencies = {}) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import .*\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${symbol}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const metadata = load(
  '../runtime/menu/utils/menu-metadata.ts',
  '({normalizeMenuMetadataPatch, normalizeMenuDocument})'
)
const creation = load(
  '../runtime/menu/utils/menu-create-input.ts',
  '({normalizeMenuCreateInput, buildMenuPayload})',
  metadata
)
const build = load(
  '../runtime/menu/utils/menu-create-input.ts',
  'buildMenuPayload',
  {
    ...metadata,
    ...creation,
    compactMenuOfferingHoursDelta: (value) => value,
  }
)
const defaultMenu = load(
  '../runtime/menu/utils/kitchen-system-menus.ts',
  'buildKitchenSystemMenu'
)

test('new Menu is catalogue-only without duplicated relationship or unused settings', () => {
  assert.deepEqual(build({ kitchenId: 'k', name: 'Lunch' }, 'Lunch'), {
    name: 'Lunch',
    status: 'draft',
    format: 'interactive',
    sort_order: 0,
  })
  const menu = defaultMenu({
    kind: 'main',
    created: 'created',
    updated: 'updated',
  })
  assert.equal(menu.name, 'Main')
  for (const key of [
    'id',
    'kitchen_id',
    'system_kind',
    'theme',
    'choices',
    'kiosk_skin_id',
    'doc',
    'ordering',
  ]) {
    assert.equal(Object.hasOwn(menu, key), false, key)
  }
})

test('document metadata is one complete optional object', () => {
  const doc = {
    url: 'https://example.com/menu.pdf',
    name: 'Menu',
    type: 'application/pdf',
    storage_path: 'menus/file.pdf',
  }
  assert.deepEqual(build({ name: 'Lunch', doc }, 'Lunch').doc, doc)
  assert.throws(() => build({ name: 'Lunch', doc: {} }, 'Lunch'), /incomplete/)
  assert.throws(
    () => build({ name: 'Lunch', doc: { url: doc.url } }, 'Lunch'),
    /incomplete/
  )
})

test('creation does not copy service policies onto a Menu', () => {
  assert.throws(
    () => build({ name: 'Lunch', ordering: { enabled: true } }, 'Lunch'),
    /Unsupported/
  )
})

const payloadSource = readFileSync(
  new URL('../runtime/menu/server/payload/build.ts', import.meta.url),
  'utf8'
).split('export async function buildMenuPayload(')[1]
const routePayload = compileFunction(
  `${stripTypeScriptTypes(`async function buildMenuPayload(${payloadSource}`)}; return buildMenuPayload`,
  [
    'sourceMenuData',
    'text',
    'record',
    'buildMenuDocumentPayload',
    'buildMenuManifestPayload',
    'readMenuSourceKind',
  ]
)(
  (scope) => scope.sourceMenu || {},
  (value) => String(value || '').trim(),
  (value) => value || {},
  (id, data, scope) => ({ kind: 'document', id, data, scope }),
  (id, data, scope) => ({ kind: 'manifest', id, data, scope }),
  (data) => (data.kind === 'menu' ? 'menu' : 'doc')
)
test('one Menu format chooses interactive content or its document', async () => {
  const menu = { name: 'Lunch', format: 'document', doc: { url: 'https://example.com/lunch.pdf' } }
  const document = await routePayload('lunch', menu, { kitchenId: 'k' })
  assert.equal(document.kind, 'document')
  assert.equal(document.data, menu)
  const interactive = await routePayload('food', { name: 'Food', format: 'interactive' }, { kitchenId: 'k' })
  assert.equal(interactive.kind, 'manifest')
})

const fileEndpointSource = readFileSync(
  new URL('../runtime/server/api/menus/[menuId]/file.get.ts', import.meta.url),
  'utf8'
)
  .replace(/import[\s\S]*?from ['"][^'"]+['"]\n/g, '')
  .replace('export default ', 'const handler = ')
async function downloadFor(target) {
  let objectPath
  const handler = compileFunction(
    `${stripTypeScriptTypes(fileEndpointSource)}; return handler`,
    [
      'createError',
      'defineEventHandler',
      'getQuery',
      'getRouterParam',
      'setResponseHeaders',
      'readRecord',
      'readRecordString',
      'downloadStorageFile',
      'runtimeStorageBucketName',
      'resolveMenuTarget',
    ]
  )(
    (input) => Object.assign(new Error(input.statusMessage), input),
    (value) => value,
    () => ({}),
    () => 'menu',
    () => {},
    (value) => value || {},
    (data, key) => String(data[key] || ''),
    async (input) => {
      objectPath = input.objectPath
      return { buffer: 'file' }
    },
    () => 'bucket',
    async () => target
  )
  await handler({})
  return objectPath
}
test('file endpoint reads only the canonical Menu document with a publication gate', async () => {
  const menuData = { status: 'published', doc: { storage_path: 'owned.pdf' }, file: { storage_path: 'wrong.pdf' } }
  assert.equal(await downloadFor({ kind: 'directory-menu', menuData }), 'owned.pdf')
  await assert.rejects(downloadFor({ kind: 'tenant-menu', menuData: { ...menuData, status: 'draft' } }), { statusCode: 404 })
})
