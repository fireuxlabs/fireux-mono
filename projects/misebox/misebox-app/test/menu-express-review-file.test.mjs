import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, deps, names) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (data) => Object.assign(new Error(data.statusMessage), data)
const contract = load(
  '../server/menu-express/contract.ts',
  { createError },
  'fail,requestId,dto'
)
const id = '11111111-1111-4111-8111-111111111111'
const revision = 'a'.repeat(64)
const fileIdentity = load(
  '../../../../packages/extensions/fireux-kitchens/src/runtime/menu/utils/records/file-identity.ts',
  {},
  'menuDocumentFileIdentity'
)
const paths = load(
  '../../../../packages/extensions/fireux-kitchens/src/runtime/menu/server/document/file.ts',
  {
    ...load(
      '../../../../packages/core/fireux-core/src/runtime/server/utils/records/read.ts',
      {},
      'readRecord,readRecordString'
    ),
    ...load(
      '../../../../packages/extensions/fireux-kitchens/src/runtime/menu/models/menu-source-upload.model.ts',
      {},
      'MenuSourceUploadStorage'
    ),
  },
  'isKitchenMenuDocumentPath,menuDocumentContentTypes'
)

function fixture() {
  const requestTarget = {
    collectionPath: 'apps/misebox-app/menu_express_requests',
  }
  const kitchenTarget = { collectionPath: 'kitchens' }
  const menusTarget = (kitchenId) => ({
    collectionPath: `kitchens/${kitchenId}/menus`,
  })
  const document = {
    url: 'https://firebasestorage.googleapis.com/v0/b/fixture-bucket/o/kitchens%2Fkitchen%2Fmenu-uploads%2Fupload%2Fsource%2Fmenu.pdf?alt=media&token=retained',
    storage_path: 'kitchens/kitchen/menu-uploads/upload/source/menu.pdf',
    name: 'menu.pdf',
    type: 'application/pdf',
  }
  const review = {
    format: 'document',
    revision,
    name: 'Menu',
    description: '',
    kitchenSlug: 'kitchen',
    menuSlug: 'menu',
    document: { url: document.url, name: document.name, type: document.type },
  }
  const request = { target: { kitchenId: 'kitchen', menuId: 'menu' }, review }
  const records = new Map([
    [`${requestTarget.collectionPath}/${id}`, request],
    ['kitchens/kitchen', { created: { app_id: 'misebox-app' } }],
    ['kitchens/kitchen/menus/menu', { doc: document }],
  ])
  const state = {
    customer: true,
    operator: true,
    currentReview: review,
    onDownload: () => {},
  }
  const reads = [],
    downloads = [],
    checks = [],
    headers = {}
  const protectedFile = load(
    '../../../../packages/extensions/fireux-kitchens/src/runtime/menu/server/document/protected-file.ts',
    {
      createError,
      setHeader: (_, name, value) => {
        headers[name] = value
      },
      ...fileIdentity,
      ...paths,
      runtimeStorageBucketName: () => 'fixture-bucket',
      parseFirebaseStorageDownloadUrl: (value) => {
        const url = new URL(value)
        const match = url.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/)
        return match
          ? { bucketName: match[1], objectPath: decodeURIComponent(match[2]) }
          : null
      },
      downloadStorageFile: async (input) => {
        downloads.push(input)
        await state.onDownload()
        return { buffer: Buffer.from('%PDF-fixture') }
      },
    },
    'readProtectedMenuFile,setProtectedMenuFileResponse'
  )
  const { readReviewFile } = load(
    '../server/menu-express/review-file.ts',
    {
      ...contract,
      ...protectedFile,
      context: () => ({ appId: 'misebox-app', target: requestTarget }),
      operator: async () => {
        if (!state.operator) throw createError({ statusCode: 403 })
        return { uid: 'operator' }
      },
      assertOperator: async (_, appId, uid) => {
        checks.push({ appId, uid })
        if (!state.operator) throw createError({ statusCode: 403 })
      },
      requireCustomer: async (_, appId, requestId, token) => {
        checks.push({ appId, requestId, token })
        if (!state.customer || token !== 'valid-proof')
          throw createError({ statusCode: 403 })
      },
      runGuardedServerTransaction: async (_, work) =>
        work({
          read: async (target, recordId) => {
            const key = `${target.collectionPath}/${recordId}`
            reads.push(key)
            return { exists: records.has(key), data: records.get(key) }
          },
        }),
      readKitchenMenuReview: async (_, kitchenId, menuId) => {
        assert.equal(kitchenId, request.target.kitchenId)
        assert.equal(menuId, request.target.menuId)
        return state.currentReview
      },
      KITCHEN_MUTATION_TARGETS: { kitchens: kitchenTarget },
      serverKitchenMenusTarget: menusTarget,
    },
    'readReviewFile'
  )
  const read = (input = {}) =>
    readReviewFile({}, id, {
      token: 'valid-proof',
      expectedRevision: revision,
      ...input,
    })
  return {
    read,
    request,
    state,
    records,
    reads,
    downloads,
    checks,
    headers,
    document,
  }
}

test('review DTO removes capability URLs without changing stored review or approval revision', () => {
  const f = fixture()
  const before = JSON.stringify(f.request)
  const dto = contract.dto(id, f.request)
  assert.deepEqual(dto.review.document, {
    name: 'menu.pdf',
    type: 'application/pdf',
  })
  assert.equal(dto.review.revision, revision)
  assert.equal(JSON.stringify(f.request), before)
  assert.doesNotMatch(
    JSON.stringify(dto),
    /retained|storage_path|firebasestorage/
  )
})

test('customer preview resolves only its request target and returns private bounded bytes', async () => {
  const f = fixture()
  assert.equal((await f.read()).toString(), '%PDF-fixture')
  assert.equal(f.checks.length, 2)
  assert.ok(f.checks.every((check) => check.requestId === id))
  assert.ok(
    f.reads.every((key) =>
      [
        `apps/misebox-app/menu_express_requests/${id}`,
        'kitchens/kitchen',
        'kitchens/kitchen/menus/menu',
      ].includes(key)
    )
  )
  assert.equal(f.downloads[0].maxBytes, 10 * 1024 * 1024)
  assert.equal(f.headers['Cache-Control'], 'private, no-store')
  assert.equal(f.headers['X-Content-Type-Options'], 'nosniff')
})

test('invalid proof, stale review and caller-supplied destinations cannot download', async () => {
  for (const change of [
    (f) => {
      f.state.customer = false
    },
    (f) => {
      f.state.currentReview = {
        ...f.state.currentReview,
        revision: 'b'.repeat(64),
      }
    },
    (f) => {
      f.request.review = null
    },
  ]) {
    const f = fixture()
    change(f)
    await assert.rejects(f.read())
    assert.equal(f.downloads.length, 0)
  }
  for (const input of [
    { kitchenId: 'foreign' },
    { storage_path: 'foreign/file' },
    { url: 'https://example.com/file' },
    { operator: 'true' },
  ]) {
    const f = fixture()
    await assert.rejects(f.read(input), { statusCode: 400 })
    assert.equal(f.downloads.length, 0)
  }
})

test('revoked customer/operator access and changed reviews discard downloaded bytes', async () => {
  for (const [input, change] of [
    [
      {},
      (f) => {
        f.state.customer = false
      },
    ],
    [
      { operator: true },
      (f) => {
        f.state.operator = false
      },
    ],
    [
      {},
      (f) => {
        f.state.currentReview = {
          ...f.state.currentReview,
          revision: 'b'.repeat(64),
        }
      },
    ],
    [
      {},
      (f) => {
        f.request.review = null
      },
    ],
  ]) {
    const f = fixture()
    f.state.onDownload = () => change(f)
    await assert.rejects(f.read(input))
    assert.equal(f.downloads.length, 1)
    assert.deepEqual(f.headers, {})
  }
})

test('a changed Storage path cannot reuse the saved attachment URL and approval', async () => {
  const f = fixture()
  f.document.storage_path =
    'kitchens/kitchen/menu-uploads/replacement/source/menu.pdf'
  await assert.rejects(f.read(), { statusCode: 404 })
  assert.equal(f.downloads.length, 0)
})
