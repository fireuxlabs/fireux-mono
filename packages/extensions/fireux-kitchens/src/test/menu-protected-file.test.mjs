import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash, timingSafeEqual } from 'node:crypto'
import { readMembershipAccessIds } from '../../../../core/fireux-core/src/runtime/app/app-user/utils/membership-access.ts'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'

const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const id = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw createError({ statusCode: 400, statusMessage: 'Invalid id' })
  return value
}
const identities = load(
  'menu/utils/records/file-identity',
  'menuDocumentFileIdentity,menuSourceFileEntries,menuSourceFileIdentity'
)
const hash = (value) => createHash('sha256').update(value).digest('hex')
const target = (collectionPath) => ({ collectionPath })
const path = 'kitchens/k/menu-uploads/s/source/menu.pdf'
const firebaseUrl = (path, bucket = 'bucket') =>
  `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=private-token`
const secret = 'a'.repeat(64)

function fixture() {
  const at = { seconds: 1, nanoseconds: 0 }
  const records = new Map([
    ['kitchens/k', { created: { by: 'k', app_id: 'app' } }],
    ['places/k', { name: 'Kitchen' }],
    [
      'apps/app/users/u',
      { role: 'user', subscription: 'free', created: { at } },
    ],
    [
      'kitchen_access/u',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
    [
      'kitchens/k/claims/guest',
      { secret_hash: hash(secret), document_menu_id: 'm' },
    ],
    [
      'kitchens/k/menus/m',
      {
        slug: 'main',
        name: 'Main',
        status: 'draft',
        format: 'document',
        doc: {
          url: firebaseUrl(path),
          storage_path: path,
          name: 'menu.pdf',
          type: 'application/pdf',
        },
      },
    ],
    [
      'kitchens/k/menu-uploads/s',
      {
        input_fingerprint: 'source-revision',
        files: [
          {
            id: 'f',
            file_url: firebaseUrl(path),
            storage_path: path,
            file_name: 'menu.pdf',
            file_type: 'application/pdf',
          },
        ],
      },
    ],
  ])
  const state = {
    anonymous: false,
    appId: 'app',
    onDownload() {},
    downloads: [],
    reads: [],
  }
  const tx = {
    async read(t, key) {
      state.reads.push(`${t.collectionPath}/${key}`)
      return {
        exists: records.has(`${t.collectionPath}/${key}`),
        data: structuredClone(records.get(`${t.collectionPath}/${key}`)),
      }
    },
    async readAll(t, limit) {
      return [...records]
        .filter(
          ([key]) =>
            key.startsWith(t.collectionPath + '/') &&
            !key.slice(t.collectionPath.length + 1).includes('/')
        )
        .slice(0, limit)
        .map(([key, data]) => ({
          id: key.split('/').at(-1),
          data: structuredClone(data),
        }))
    },
  }
  const deps = {
    ...identities,
    createError,
    createHash,
    timingSafeEqual,
    KITCHEN_MUTATION_TARGETS: { kitchens: target('kitchens') },
    PLACE_MUTATION_TARGETS: { places: target('places') },
    serverKitchenMenusTarget: (k) => target(`kitchens/${k}/menus`),
    serverKitchenMenuSectionsTarget: (k, m) =>
      target(`kitchens/${k}/menus/${m}/sections`),
    serverKitchenMenuUploadsTarget: (k) => target(`kitchens/${k}/menu-uploads`),
    serverAppUsersTarget: (a) => target(`apps/${a}/users`),
    serverKitchenAccessTarget: () => target('kitchen_access'),
    guestKitchenClaimTarget: (k) => target(`kitchens/${k}/claims`),
    hashGuestKitchenSecret: hash,
    requireFirestoreDocumentId: id,
    useFireUXConfig: () => ({ appId: state.appId }),
    requireFirebaseBearerUser: async (_, __, options = {}) => {
      if (state.anonymous && !options.allowAnonymous)
        throw createError({
          statusCode: 401,
          statusMessage: 'Sign in required',
        })
      return { uid: 'u' }
    },
    runGuardedServerTransaction: async (_, run) => run(tx),
    getRuntimeFirestore: () => ({}),
    readAppUserSubscription: (value) =>
      ['free', 'pro', 'business'].includes(value) ? value : '',
    readKitchenAccessIds: load(
      'kitchen/utils/kitchen-access',
      'readKitchenAccessIds',
      { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 }
    ).readKitchenAccessIds,
    readRecord: (v) =>
      v && typeof v === 'object' && !Array.isArray(v) ? v : {},
    readRecordString: (v, k) => (typeof v[k] === 'string' ? v[k].trim() : ''),
    MenuSourceUploadStorage: { collection: 'menu-uploads' },
    runtimeStorageBucketName: () => 'bucket',
    parseFirebaseStorageDownloadUrl: (value) => {
      try {
        const u = new URL(value),
          m = u.pathname.match(/^\/v0\/b\/([^/]+)\/o\/(.+)$/)
        return u.hostname === 'firebasestorage.googleapis.com' && m
          ? {
              bucketName: decodeURIComponent(m[1]),
              objectPath: decodeURIComponent(m[2]),
            }
          : null
      } catch {
        return null
      }
    },
    downloadStorageFile: async (input) => {
      state.downloads.push(input)
      await state.onDownload()
      return { buffer: Buffer.from('pdf'), generation: '42' }
    },
    setHeader: (event, key, value) => {
      event.headers[key] = value
    },
  }
  Object.assign(
    deps,
    load(
      'kitchen/server/core/operator-access',
      'requireKitchenWriterAccount',
      deps
    )
  )
  Object.assign(
    deps,
    load(
      'kitchen/server/core/mutation-authority',
      'readKitchenMutationActor,requireKitchenRecordMutationAuthority',
      deps
    )
  )
  Object.assign(
    deps,
    load(
      'menu/server/document/authority',
      'readMenuDocumentActor,requireMenuDocumentAuthority',
      deps
    )
  )
  Object.assign(
    deps,
    load(
      'menu/server/document/read',
      'menuDocumentRevision,menuDocumentToolProjection',
      deps
    )
  )
  Object.assign(
    deps,
    load(
      'menu/server/document/file',
      'isKitchenMenuDocumentPath,menuDocumentContentTypes',
      deps
    )
  )
  Object.assign(
    deps,
    load(
      'menu/server/document/protected-file',
      'readProtectedMenuFile,setProtectedMenuFileResponse',
      deps
    )
  )
  const document = load(
    'menu/server/document/read-file',
    'readKitchenMenuDocumentFile',
    deps
  ).readKitchenMenuDocumentFile
  const source = load(
    'menu/server/source/read-file',
    'readKitchenMenuSourceFile',
    deps
  ).readKitchenMenuSourceFile
  const menu = () => records.get('kitchens/k/menus/m')
  const upload = () => records.get('kitchens/k/menu-uploads/s')
  return {
    records,
    state,
    deps,
    menu,
    upload,
    document: (input = {}) =>
      document(
        {},
        {
          kitchenId: 'k',
          menuId: 'm',
          expectedRevision: deps.menuDocumentRevision(menu()),
          ...input,
        }
      ),
    source: (input = {}) =>
      source(
        {},
        {
          kitchenId: 'k',
          sourceId: 's',
          fileId: 'f',
          expectedRevision: hash(
            identities.menuSourceFileIdentity(upload(), 'f')
          ),
          ...input,
        }
      ),
  }
}

test('operator reads exact draft and archived documents with private safe response headers', async () => {
  const f = fixture()
  for (const status of ['draft', 'published', 'archived']) {
    f.menu().status = status
    const result = await f.document()
    assert.equal(result.buffer.toString(), 'pdf')
    const event = { headers: {} }
    assert.equal(
      f.deps.setProtectedMenuFileResponse(event, result),
      result.buffer
    )
    assert.deepEqual(event.headers, {
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="menu.pdf"',
    })
  }
  assert.equal(
    f.state.downloads.every(
      (d) => d.maxBytes === 10 * 1024 * 1024 && d.objectPath === path
    ),
    true
  )
})

test('guest recovery proof reads only the pinned active Menu, never archived or other Menus', async () => {
  const f = fixture()
  f.state.anonymous = true
  f.records.delete('apps/app/users/u')
  assert.equal(
    (await f.document({ claimSecret: secret })).buffer.toString(),
    'pdf'
  )
  f.records.set('kitchens/k/menus/other', structuredClone(f.menu()))
  await assert.rejects(f.document({ menuId: 'other', claimSecret: secret }), {
    statusCode: 403,
  })
  f.menu().status = 'archived'
  await assert.rejects(f.document({ claimSecret: secret }), { statusCode: 409 })
  assert.equal(f.state.downloads.length, 1)
})

test('missing authority, runtime App mismatch and stale membership creation fail before bytes', async () => {
  for (const mutate of [
    (f) => f.records.delete('apps/app/users/u'),
    (f) => {
      f.state.appId = 'another-app'
    },
    (f) => {
      f.records.get('apps/app/users/u').created.at = {
        seconds: 2,
        nanoseconds: 0,
      }
    },
  ]) {
    const f = fixture()
    mutate(f)
    await assert.rejects(f.document(), { statusCode: 403 })
    await assert.rejects(f.source(), { statusCode: 403 })
    assert.equal(f.state.downloads.length, 0)
  }
})

test('current and proven legacy paths work; foreign Kitchen, source, bucket and URL/path mismatches fail', async () => {
  const f = fixture()
  const legacy = 'apps/app/' + path
  f.menu().doc.storage_path = legacy
  f.menu().doc.url = firebaseUrl(legacy)
  assert.equal((await f.document()).buffer.toString(), 'pdf')
  for (const bad of [
    'apps/foreign/' + path,
    path.replace('kitchens/k/', 'kitchens/other/'),
    path.replace('/source/', '/../'),
    '',
  ]) {
    f.menu().doc.storage_path = bad
    f.menu().doc.url = firebaseUrl(bad)
    await assert.rejects(f.document(), { statusCode: 404 })
  }
  f.menu().doc.storage_path = path
  f.menu().doc.url = firebaseUrl(path, 'other-bucket')
  await assert.rejects(f.document(), { statusCode: 404 })
  f.menu().doc.url = firebaseUrl(path.replace('menu.pdf', 'other.pdf'))
  await assert.rejects(f.document(), { statusCode: 404 })
  f.upload().files[0].storage_path = path.replace('/s/', '/other-source/')
  f.upload().files[0].file_url = firebaseUrl(f.upload().files[0].storage_path)
  await assert.rejects(f.source(), { statusCode: 404 })
  assert.equal(f.state.downloads.length, 1)
})

test('revocation, record replacement and guest claim during download withhold bytes', async () => {
  for (const reader of ['document', 'source']) {
    const f = fixture()
    f.state.onDownload = () => f.records.delete('kitchen_access/u')
    await assert.rejects(f[reader](), { statusCode: 403 })
  }
  const f = fixture()
  f.state.onDownload = () => {
    f.menu().doc.name = 'replacement.pdf'
  }
  await assert.rejects(f.document(), { statusCode: 409 })
  const s = fixture()
  s.state.onDownload = () => {
    s.upload().files[0].file_name = 'replacement.pdf'
  }
  await assert.rejects(s.source(), { statusCode: 409 })
  const guest = fixture()
  guest.records.delete('apps/app/users/u')
  guest.state.anonymous = true
  guest.state.onDownload = () => {
    guest.records.get('kitchens/k/claims/guest').claimed_by = 'someone'
  }
  await assert.rejects(guest.document({ claimSecret: secret }), {
    statusCode: 403,
  })
})

test('source file selection supports all stored IDs and primary legacy file, rejects missing or ambiguous IDs', async () => {
  const f = fixture()
  f.upload().files.push({
    ...f.upload().files[0],
    id: 'second',
    file_name: 'page-two.pdf',
    sort_order: 1,
  })
  const revision = hash(identities.menuSourceFileIdentity(f.upload(), 'second'))
  assert.equal(
    (await f.source({ fileId: 'second', expectedRevision: revision })).fileName,
    'page-two.pdf'
  )
  await assert.rejects(f.source({ fileId: 'missing' }), { statusCode: 404 })
  f.upload().files.push({ ...f.upload().files[0] })
  await assert.rejects(f.source(), { statusCode: 404 })
  f.records.set('kitchens/k/menu-uploads/s', { ...f.upload().files[0] })
  assert.equal(
    (
      await f.source({
        fileId: '1',
        expectedRevision: hash(
          identities.menuSourceFileIdentity(f.upload(), '1')
        ),
      })
    ).buffer.toString(),
    'pdf'
  )
})

test('canonical revisions ignore object key order, track file replacement, and source processing leaves revision stable', () => {
  const a = {
    doc: { url: 'url', name: 'name', type: 'type', storage_path: 'path' },
    status: 'draft',
  }
  const b = {
    status: 'draft',
    doc: { storage_path: 'path', type: 'type', name: 'name', url: 'url' },
  }
  assert.equal(
    identities.menuDocumentFileIdentity(a),
    identities.menuDocumentFileIdentity(b)
  )
  const source = {
    storage_path: path,
    file_url: 'url',
    file_name: 'menu.pdf',
    status: 'processing',
  }
  const original = identities.menuSourceFileIdentity(source, '1')
  source.status = 'ready'
  source.updated = { at: 42 }
  assert.equal(identities.menuSourceFileIdentity(source, '1'), original)
  source.file_url = 'replacement'
  assert.notEqual(identities.menuSourceFileIdentity(source, '1'), original)
  assert.deepEqual(
    identities.menuSourceFileEntries({
      source_url: 'https://example.test/menu',
    }),
    []
  )
})

test('malformed or stale revisions and unsupported Daily documents fail without downloading', async () => {
  const f = fixture()
  await assert.rejects(f.document({ expectedRevision: 'bad' }), {
    statusCode: 400,
  })
  await assert.rejects(f.document({ expectedRevision: '0'.repeat(64) }), {
    statusCode: 409,
  })
  f.menu().schedule = 'daily'
  await assert.rejects(f.document(), { statusCode: 404 })
  assert.equal(f.state.downloads.length, 0)
})

test('untrusted MIME and filename cannot create inline active content or response headers', async () => {
  const f = fixture()
  f.menu().doc.type = 'text/html'
  f.menu().doc.name = 'bad"\r\nInjected: yes\\.html'
  const result = await f.document(),
    event = { headers: {} }
  f.deps.setProtectedMenuFileResponse(event, result)
  assert.equal(result.contentType, 'application/octet-stream')
  assert.match(event.headers['Content-Disposition'], /^attachment;/)
  assert.doesNotMatch(event.headers['Content-Disposition'], /[\r\n\\]/)
})

test('provider errors are sanitized instead of exposing token URLs and object paths', async () => {
  const f = fixture()
  f.state.onDownload = () => {
    throw new Error(firebaseUrl(path))
  }
  await assert.rejects(
    f.document(),
    (error) =>
      error.statusCode === 503 &&
      !error.message.includes('token') &&
      !error.message.includes(path)
  )
})
