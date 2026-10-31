import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { createHash } from 'node:crypto'

const kitchens = '../../../../packages/extensions/fireux-kitchens/src/runtime/'
function load(file, deps, names) {
  const code = readFileSync(new URL(file, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(code)};return {${names}}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
const createError = (x) => Object.assign(new Error(x.statusMessage), x)
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex')
const id = '11111111-1111-4111-8111-111111111111'
function fixture() {
  const records = new Map(),
    files = new Map(),
    target = { collectionPath: 'apps/misebox-app/menu_express_requests' }
  let allowed = true,
    storageWrites = 0,
    privateReads = 0,
    revokeAfterSave = false
  const transaction = async (_options, run) => {
    const staged = []
    const result = await run({
      read: async (t, id) => ({
        exists: records.has(`${t.collectionPath}/${id}`),
        data: structuredClone(records.get(`${t.collectionPath}/${id}`)),
      }),
      create: (t, id, value) =>
        staged.push(() => {
          const key = `${t.collectionPath}/${id}`
          if (records.has(key)) throw Error('Duplicate')
          records.set(key, structuredClone(value))
        }),
      update: (t, id, value) =>
        staged.push(() =>
          records.set(`${t.collectionPath}/${id}`, {
            ...records.get(`${t.collectionPath}/${id}`),
            ...value,
          })
        ),
    })
    staged.forEach((write) => write())
    return result
  }
  const assertWriter = async ({ kitchenId }) => {
    if (!allowed || kitchenId !== 'kitchen-a')
      throw createError({ statusCode: 403, statusMessage: 'Kitchen denied' })
  }
  const deps = {
    createHash,
    createError,
    FieldValue: { delete: () => null },
    runGuardedServerTransaction: transaction,
    requireKitchenWriterAccount: assertWriter,
    assertKitchenMenuCurrencyCode: async () => 'CHF',
    requireMenuName: (source) => {
      if (!/^[a-z0-9-]+$/.test(source)) throw Error('Invalid source id')
    },
    serverKitchenMenuUploadsTarget: (kitchenId) => ({
      collectionPath: `kitchens/${kitchenId}/menu-uploads`,
    }),
    MenuSourceUploadStorage: { collection: 'menu-uploads' },
    readString: (value) => String(value || ''),
    documentKindFromFile: () => 'pdf',
    serverAuditStamp: ({ by }) => ({ by, at: 'fixture' }),
    saveStorageFileWithDownloadToken: async ({ objectPath, data }) => {
      storageWrites++
      files.set(objectPath, data)
      if (revokeAfterSave) allowed = false
      return { fileUrl: `https://storage.example/${objectPath}` }
    },
    deleteStorageFileIfExists: async () => {},
  }
  Object.assign(
    deps,
    load(
      kitchens + 'menu/server/source/uploads.ts',
      deps,
      'saveKitchenMenuUploadFiles,kitchenMenuUploadRecord,kitchenMenuUploadResponse,storagePathsFromMenuUpload'
    )
  )
  Object.assign(
    deps,
    load(
      kitchens + 'menu/server/source/url-sources.ts',
      deps,
      'kitchenMenuUrlSourceRecord'
    )
  )
  const { saveKitchenMenuSource } = load(
    kitchens + 'menu/server/source/save.ts',
    deps,
    'saveKitchenMenuSource'
  )
  const contract = load(
    '../server/menu-express/contract.ts',
    { createError },
    'dto,fail,requestId,requirePaid,text'
  )
  const operator = async (event) => {
    if (!event.admin) throw Error('Operator denied')
    return { uid: 'operator', appId: 'misebox-app', target }
  }
  const { prepareRequest } = load(
    '../server/menu-express/preparation.ts',
    {
      ...contract,
      createHash,
      operator,
      runGuardedServerTransaction: transaction,
      assertOperator: async () => {},
      requireChatSessionAccess: async () => {},
      requireKitchenWriterAccount: assertWriter,
      saveKitchenMenuSource,
      downloadStorageFile: async ({ objectPath }) => {
        privateReads++
        return { buffer: files.get(objectPath) }
      },
    },
    'prepareRequest'
  )
  const bytes = Buffer.from('%PDF-TEST two item Menu'),
    sourceId = hash(bytes)
  const request = {
    id,
    contact: { name: 'TEST', email: 'test@example.com' },
    venue: 'TEST',
    location: 'Test',
    sourceUrl: '',
    instructions: 'Do not sell',
    demo: true,
    stage: 'received',
    payment: { status: 'paid', sessionId: '', attempt: 0, priceId: '' },
    target: null,
    review: null,
    approval: null,
    correction: '',
    delivery: null,
    sources: [{ id: sourceId, name: 'TEST-menu.pdf', type: 'application/pdf' }],
    createdAt: '2026-10-31T00:00:00Z',
    updatedAt: '2026-10-31T00:00:00Z',
  }
  files.set(`apps/misebox-app/menu-express/${id}/sources/${sourceId}`, bytes)
  records.set(`${target.collectionPath}/${id}`, request)
  const input = {
    appId: 'misebox-app',
    kitchenId: 'kitchen-a',
    uploadId: 'workspace-source',
    replaceExisting: false,
    files: [
      {
        data: bytes,
        fileName: 'TEST-menu.pdf',
        contentType: 'application/pdf',
      },
    ],
  }
  const { handler: upload } = load(
    kitchens + 'server/api/workspace/kitchen/menus/upload.post.ts',
    {
      defineEventHandler: (fn) => fn,
      setKitchenMenuUploadCors() {},
      requireKitchenMenuUploadUser: async () => 'operator',
      readKitchenMenuUploadRequest: async () => input,
      saveKitchenMenuSource,
    },
    'handler'
  )
  return {
    records,
    files,
    request,
    input,
    upload,
    prepareRequest,
    saveKitchenMenuSource,
    counts: () => ({ storageWrites, privateReads }),
    revoke: () => {
      allowed = false
    },
    revokeDuringSave: () => {
      revokeAfterSave = true
    },
  }
}

test('Workspace and Menu Express pass the same source into the same Menus command', async () => {
  const f = fixture()
  const workspace = await f.upload({})
  const service = await f.prepareRequest({ admin: true }, id, {
    kitchenId: 'kitchen-a',
  })
  assert.equal(workspace.id, 'workspace-source')
  assert.deepEqual(service.target, {
    kitchenId: 'kitchen-a',
    menuId: `menu-express-${id}`,
  })
  const a = f.records.get('kitchens/kitchen-a/menu-uploads/workspace-source')
  const b = f.records.get(`kitchens/kitchen-a/menu-uploads/menu-express-${id}`)
  assert.equal(a.files[0].file_name, b.files[0].file_name)
  assert.equal(a.files[0].file_type, b.files[0].file_type)
  assert.deepEqual(f.files.get(a.storage_path), f.files.get(b.storage_path))
  assert.equal(b.id, service.target.menuId)
  assert.equal(service.stage, 'preparing')
  assert.equal(f.counts().privateReads, 1)
})

test('retry preserves one source and its applied Menu, with no additional Storage write', async () => {
  const f = fixture()
  await f.prepareRequest({ admin: true }, id, { kitchenId: 'kitchen-a' })
  const key = `kitchens/kitchen-a/menu-uploads/menu-express-${id}`
  f.records.get(key).ai_draft = {
    applied: { slug: 'test-menu', menu_written: true },
  }
  const before = f.counts().storageWrites
  await f.prepareRequest({ admin: true }, id, { kitchenId: 'kitchen-a' })
  assert.equal(f.counts().storageWrites, before)
  assert.equal(f.records.get(key).ai_draft.applied.slug, 'test-menu')
  assert.equal(
    [...f.records.keys()].filter((key) => key.includes('/menu-uploads/'))
      .length,
    1
  )
  await f.upload({})
  await f.upload({})
  assert.equal(
    [...f.records.keys()].filter((key) => key.includes('/menu-uploads/'))
      .length,
    2
  )
})

test('URL-only service requests use the ordinary Menu URL source, without file transfer', async () => {
  const f = fixture()
  f.request.sources = []
  f.request.sourceUrl = 'https://example.com/test-menu'
  await f.prepareRequest({ admin: true }, id, { kitchenId: 'kitchen-a' })
  const source = f.records.get(
    `kitchens/kitchen-a/menu-uploads/menu-express-${id}`
  )
  assert.equal(source.source_url, 'https://example.com/test-menu')
  assert.equal(source.tool, 'url')
  assert.deepEqual(f.counts(), { storageWrites: 0, privateReads: 0 })
})

test('unpaid, foreign and altered source inputs do not create a preparation', async () => {
  for (const mode of ['unpaid', 'foreign', 'changed']) {
    const f = fixture()
    if (mode === 'unpaid') f.request.payment.status = 'unpaid'
    if (mode === 'changed')
      f.files.set(
        `apps/misebox-app/menu-express/${id}/sources/${f.request.sources[0].id}`,
        Buffer.from('changed')
      )
    await assert.rejects(
      f.prepareRequest({ admin: true }, id, {
        kitchenId: mode === 'foreign' ? 'foreign' : 'kitchen-a',
      })
    )
    assert.equal(
      [...f.records.keys()].some((key) => key.includes('/menu-uploads/')),
      false
    )
    assert.equal(f.counts().storageWrites, 0)
  }
})

test('revoked authority before source commit cannot attach a source; changed retries cannot overwrite it', async () => {
  const denied = fixture()
  denied.revokeDuringSave()
  await assert.rejects(
    denied.prepareRequest({ admin: true }, id, { kitchenId: 'kitchen-a' }),
    /denied/
  )
  assert.equal(
    [...denied.records.keys()].some((key) => key.includes('/menu-uploads/')),
    false
  )
  const f = fixture()
  await f.upload({})
  await assert.rejects(
    f.saveKitchenMenuSource(
      {
        ...f.input,
        files: [{ ...f.input.files[0], data: Buffer.from('other') }],
      },
      'operator'
    ),
    /another preparation/
  )
  assert.equal(f.counts().storageWrites, 1)
})

test('manual Menu linking is not an input to preparation', async () => {
  const f = fixture()
  await assert.rejects(
    f.prepareRequest({ admin: true }, id, {
      kitchenId: 'kitchen-a',
      menuId: 'other',
    }),
    /not a manually linked Menu/
  )
  assert.deepEqual(f.counts(), { storageWrites: 0, privateReads: 0 })
})
