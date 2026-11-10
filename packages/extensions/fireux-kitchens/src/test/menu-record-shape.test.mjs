import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { menuDocumentFilePath } from '../runtime/menu/utils/navigation/route.ts'
import {
  readRecord,
  readRecordString,
} from 'fireux-core/runtime/server/utils/records/read'
import { loadOfferingSource } from './offering-test-helpers.mjs'
import {
  isKitchenMenuDocumentPath,
  menuDocumentContentTypes,
} from '../runtime/menu/server/document/file.ts'

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
  '../runtime/menu/utils/records/metadata.ts',
  '({normalizeMenuMetadataPatch, normalizeMenuDocument})'
)
const creation = load(
  '../runtime/menu/utils/records/create-input.ts',
  '({normalizeMenuCreateInput, buildMenuPayload})',
  metadata
)
const build = load(
  '../runtime/menu/utils/records/create-input.ts',
  'buildMenuPayload',
  {
    ...metadata,
    ...creation,
    compactMenuOfferingHoursDelta: (value) => value,
  }
)
const defaultMenu = load(
  '../runtime/kitchen/server/index/onboarding/system-menus.ts',
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

test('only the document commands accept complete attachment metadata', () => {
  const doc = {
    url: 'https://example.com/menu.pdf',
    name: 'Menu',
    type: 'application/pdf',
    storage_path: 'menus/file.pdf',
  }
  assert.throws(() => build({ name: 'Lunch', doc }, 'Lunch'), /Unsupported/)
  assert.deepEqual(metadata.normalizeMenuDocument(doc), doc)
  assert.throws(() => metadata.normalizeMenuDocument({}), /incomplete/)
  assert.throws(
    () => metadata.normalizeMenuDocument({ url: doc.url }),
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
  const menu = {
    name: 'Lunch',
    format: 'document',
    doc: { url: 'https://example.com/lunch.pdf' },
  }
  const document = await routePayload('lunch', menu, { kitchenId: 'k' })
  assert.equal(document.kind, 'document')
  assert.equal(document.data, menu)
  const interactive = await routePayload(
    'food',
    { name: 'Food', format: 'interactive' },
    { kitchenId: 'k' }
  )
  assert.equal(interactive.kind, 'manifest')
  const daily = await routePayload('today', { ...menu, schedule: 'daily' }, {})
  assert.equal(daily.kind, 'manifest')
})

test('published file projections expose only a scoped route while URL-only records keep their web link', () => {
  const fileReaders = loadOfferingSource(
    'menu/server/payload/file',
    'readMenuFile,hasMenuFile,readMenuDocumentKind',
    { readRecord, readRecordString, menuDocumentFilePath }
  )
  const { buildMenuDocumentPayload } = loadOfferingSource(
    'menu/server/payload/document',
    'buildMenuDocumentPayload',
    {
      ...fileReaders,
      readRecordString,
      readKitchenPublicOfferings: () => [],
      menuFileKind: () => 'pdf',
      menuPayloadPresentation: () => ({}),
      compactMenuFile: (file) => file,
    }
  )
  const doc = {
    name: 'Lunch.pdf',
    type: 'application/pdf',
    url: 'https://files.example/lunch?token=secret-token',
    storage_path: 'kitchens/k/menu-uploads/revision/source/Lunch.pdf',
  }
  for (const [routeKind, url] of [
    ['directory-menu', '/api/menus/lunch/file?kitchenSlug=caf%C3%A9'],
    ['tenant-menu', '/api/menus/lunch/file'],
  ]) {
    const payload = buildMenuDocumentPayload(
      'lunch',
      { doc },
      { kitchenId: 'k', kitchenSlug: 'café', routeKind }
    )
    assert.deepEqual(payload.document.file, {
      url,
      name: 'Lunch.pdf',
      type: 'application/pdf',
    })
    assert.doesNotMatch(JSON.stringify(payload), /secret-token|menu-uploads/)
  }
  for (const url of [
    'https://venue.example/menu.pdf',
    'http://venue.example/menu.pdf',
    'javascript:alert(1)',
  ]) {
    const payload = buildMenuDocumentPayload('lunch', {
      doc: { name: 'Lunch', url },
    })
    assert.equal(payload.document.file.url, url.startsWith('http') ? url : '')
  }
})

const fileEndpointSource = readFileSync(
  new URL('../runtime/server/api/menus/[menuId]/file.get.ts', import.meta.url),
  'utf8'
)
  .replace(/import[\s\S]*?from ['"][^'"]+['"]\n/g, '')
  .replace('export default ', 'const handler = ')
async function downloadFor(target, downloads = []) {
  let headers
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
      'isKitchenMenuDocumentPath',
      'menuDocumentContentTypes',
    ]
  )(
    (input) => Object.assign(new Error(input.statusMessage), input),
    (value) => value,
    () => ({}),
    () => 'menu',
    (_, value) => {
      headers = value
    },
    (value) => value || {},
    (data, key) => String(data[key] || ''),
    async (input) => {
      downloads.push(input.objectPath)
      return { buffer: 'file' }
    },
    () => 'bucket',
    async () => target,
    isKitchenMenuDocumentPath,
    menuDocumentContentTypes
  )
  await handler({})
  return headers
}

const fileTarget = (path, changes = {}) => ({
  kind: 'directory-menu',
  appId: 'directory',
  kitchenId: 'k',
  rootKitchenData: {
    created: { app_id: 'origin' },
    management: { mode: 'app', app_id: 'tenant' },
  },
  menuData: {
    status: 'published',
    doc: { storage_path: path, type: 'application/pdf', name: 'menu.pdf' },
    file: { storage_path: 'wrong.pdf' },
    ...changes,
  },
})

test('public file reads only the owning Kitchen’s published Menu uploads, including prior App scopes', async () => {
  const path = 'kitchens/k/menu-uploads/revision/source/menu.pdf'
  for (const owned of [path, 'apps/origin/' + path, 'apps/tenant/' + path]) {
    const downloads = []
    const headers = await downloadFor(fileTarget(owned), downloads)
    assert.deepEqual(downloads, [owned])
    assert.equal(headers['Cache-Control'], 'no-store')
    assert.equal(headers['Content-Type'], 'application/pdf')
    assert.equal(headers['X-Content-Type-Options'], 'nosniff')
  }
  const unsafeType = fileTarget(path, {
    doc: { storage_path: path, type: 'text/html' },
  })
  const headers = await downloadFor(unsafeType)
  assert.equal(headers['Content-Type'], 'application/octet-stream')
  assert.match(headers['Content-Disposition'], /^attachment;/)
})

test('foreign, malformed, unpublished and Daily attachments are rejected before Storage', async () => {
  const path = 'kitchens/k/menu-uploads/u/source/menu.pdf'
  const forbidden = [
    'kitchens/other/menu-uploads/u/source/menu.pdf',
    'kitchens/k/claims/guest',
    'menus/lunch/source/menu.pdf',
    'apps/directory/' + path,
    'apps/other/' + path,
    'kitchens/k/menu-uploads/u/source/../secret',
    'kitchens/k/menu-uploads/u/source/..',
    'kitchens/k/menu-uploads/u/source/',
  ]
  const downloads = []
  for (const target of [
    ...forbidden.map((foreign) => fileTarget(foreign)),
    fileTarget(path, { status: 'draft' }),
    fileTarget(path, { status: 'archived' }),
    fileTarget(path, { schedule: 'daily' }),
  ]) {
    await assert.rejects(downloadFor(target, downloads), { statusCode: 404 })
  }
  assert.deepEqual(downloads, [])
})
