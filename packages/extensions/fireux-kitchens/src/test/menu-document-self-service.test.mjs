import assert from 'node:assert/strict'
import test from 'node:test'
import { createHash, timingSafeEqual } from 'node:crypto'
import QRCode from 'qrcode'
import { readMembershipAccessIds } from '../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'

const target = (collectionPath) => ({ collectionPath })
const secret = 'a'.repeat(64)
const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const fail = (statusCode, statusMessage) => {
  throw createError({ statusCode, statusMessage })
}
const id = (value) => {
  if (typeof value !== 'string' || !value || value.includes('/'))
    throw Error('Invalid id')
  return value
}
const keys = {
  KITCHEN_MUTATION_TARGETS: { kitchens: target('kitchens') },
  PLACE_MUTATION_TARGETS: { places: target('places') },
  serverKitchenMenusTarget: (k) => target(`kitchens/${k}/menus`),
  serverKitchenMenuSectionsTarget: (k, m) =>
    target(`kitchens/${k}/menus/${m}/sections`),
  serverKitchenTeamMembersTarget: (k) => target(`kitchens/${k}/team`),
}
const guest = load(
  'kitchen/server/index/onboarding/guest-claim',
  'guestKitchenClaimTarget,hashGuestKitchenSecret',
  {
    createHash,
    defineFirestoreMutationTarget: (value) => value,
    requireFirestoreDocumentId: id,
    fail,
  }
)
const metadata = load('menu/utils/records/metadata', 'normalizeMenuDocument')

function fixture() {
  const records = new Map(),
    assets = new Map(),
    removed = []
  const state = {
    uid: 'guest-123',
    appId: 'app',
    anonymous: true,
    onUpload() {},
    failCommit: false,
    loseResponse: false,
  }
  let sequence = 0
  const stamp = ({ by, appId }) => ({
    by,
    ...(appId ? { app_id: appId } : {}),
    at: 'fixture-time',
  })
  const children = (path) =>
    [...records]
      .filter(
        ([key]) =>
          key.startsWith(path + '/') &&
          !key.slice(path.length + 1).includes('/')
      )
      .map(([key, data]) => ({
        id: key.slice(path.length + 1),
        data: structuredClone(data),
      }))
  const transaction = async (_, run) => {
    const writes = []
    let writing = false
    const tx = {
      read: async (t, key) => {
        assert.equal(writing, false, 'read after write')
        const path = `${t.collectionPath}/${key}`
        return {
          exists: records.has(path),
          data: structuredClone(records.get(path)),
        }
      },
      readAll: async (t, limit) => {
        assert.equal(writing, false)
        return children(t.collectionPath).slice(0, limit)
      },
      query: async (t, q) => {
        assert.equal(writing, false)
        return children(t.collectionPath)
          .filter((row) => row.data[q.field] === q.value)
          .slice(0, q.limit)
      },
      create: (t, key, value) => {
        writing = true
        writes.push(() => {
          const path = `${t.collectionPath}/${key}`
          assert.equal(records.has(path), false)
          records.set(path, structuredClone(value))
        })
      },
      update: (t, key, value) => {
        writing = true
        writes.push(() => {
          const path = `${t.collectionPath}/${key}`
          assert.equal(records.has(path), true)
          records.set(path, { ...records.get(path), ...structuredClone(value) })
        })
      },
    }
    const result = await run(tx)
    if (writes.length && state.failCommit) throw Error('Commit failed')
    writes.forEach((write) => write())
    if (writes.length && state.loseResponse) {
      state.loseResponse = false
      throw Error('Commit response lost')
    }
    return result
  }
  const deps = {
    ...keys,
    ...guest,
    ...metadata,
    ...load('menu/utils/records/file-identity', 'menuDocumentFileIdentity'),
    ...load('menu/utils/navigation/route', 'menuDocumentFilePath', {
      MenuRouteContexts: ['generic'],
    }),
    createError,
    fail,
    createHash,
    timingSafeEqual,
    requireFirestoreDocumentId: id,
    serverAuditStamp: stamp,
    runGuardedServerTransaction: transaction,
    useFireUXConfig: () => ({ appId: state.appId }),
    requireFirebaseBearerUser: async () => {
      if (!state.uid) throw Error('Identity required')
      return {
        uid: state.uid,
        decoded: {
          firebase: {
            sign_in_provider: state.anonymous ? 'anonymous' : 'google.com',
          },
        },
      }
    },
    resolveWorkspaceEntityOnboardingPolicy: () => ({
      appId: state.appId,
      canCreate: true,
    }),
    readKitchenOnboardingRequest: (input, fields) => {
      if (Object.keys(input).some((key) => !fields.includes(key)))
        throw Error('Unsupported field')
      return input
    },
    buildKitchenTeamMemberRecord: ({ name, userId }) => ({
      name,
      user_id: userId,
    }),
    createDefaultKitchenStation() {},
    randomUUID: () => `asset-${++sequence}`,
    getRuntimeFirestore: () => ({}),
    serverAppUsersTarget: (app) => target(`apps/${app}/users`),
    serverKitchenAccessTarget: () => target('kitchen_access'),
    readKitchenAccessIds: load(
      'kitchen/utils/kitchen-access',
      'readKitchenAccessIds',
      { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 }
    ).readKitchenAccessIds,
    saveKitchenMenuUploadFiles: async (input) => {
      const file = input.files[0],
        path = `kitchens/${input.kitchenId}/menu-uploads/${input.uploadId}/source/${file.fileName}`,
        url = `https://files.example/${input.uploadId}/${file.fileName}`
      assets.set(path, { url, bytes: Buffer.from(file.data) })
      await state.onUpload()
      return [
        {
          fileUrl: url,
          objectPath: path,
          fileName: file.fileName,
          contentType: file.contentType,
        },
      ]
    },
    deleteStorageFileIfExists: async ({ objectPath }) => {
      removed.push(objectPath)
      assets.delete(objectPath)
    },
    runtimeStorageBucketName: () => 'fixture-bucket',
    stagePlaceUpdate: (tx, kitchenId, patch, place, actor) => {
      assert.deepEqual(Object.keys(patch), ['name'])
      tx.update(keys.PLACE_MUTATION_TARGETS.places, kitchenId, {
        name: patch.name,
        updated: stamp({ by: actor.uid, appId: actor.runtimeAppId }),
      })
    },
  }
  Object.assign(
    deps,
    load(
      'kitchen/server/index/onboarding/system-menus',
      'createKitchenSystemMenus',
      deps
    )
  )
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
      'menu/server/document/authority',
      'readMenuDocumentActor,requireMenuDocumentAuthority,assertMenuAcceptsDocument',
      deps
    )
  )
  Object.assign(
    deps,
    load(
      'menu/server/publication/validation',
      'assertKitchenMenuCanPublish',
      deps
    )
  )
  Object.assign(
    deps,
    load('menu/server/publication/publish', 'stagePublishKitchenMenu', deps)
  )
  Object.assign(
    deps,
    load(
      'menu/server/document/read',
      'menuDocumentRevision,menuDocumentToolProjection,readKitchenDocumentMenu',
      deps
    )
  )
  const { startGuestKitchen } = load(
    'kitchen/server/index/onboarding/guest',
    'startGuestKitchen',
    deps
  )
  const { saveKitchenDocumentMenu } = load(
    'menu/server/document/save',
    'saveKitchenDocumentMenu',
    deps
  )
  const { scopedTarget } = load(
    'menu/server/ownership/scoped-target',
    'scopedTarget',
    {
      getRuntimeFirestore: () => ({
        collection: (path) => ({
          where: (field, op, value) => ({
            limit: (count) => ({
              get: async () => ({
                docs: children(path)
                  .filter((row) => row.data[field] === value)
                  .slice(0, count)
                  .map((row) => ({ id: row.id, data: () => row.data })),
              }),
            }),
          }),
        }),
      }),
      readRecordString: (record, key) =>
        typeof record[key] === 'string' ? record[key] : '',
      readMenuKitchenPlaceData: async (kitchenId) =>
        hRecord(`places/${kitchenId}`),
      readKitchenPresentation: (_, place) => ({ name: place.name }),
      readKitchenSproochliAttachment: async () => ({ enabled: false }),
      readKitchenOfferings: async () => [],
      createError,
    }
  )
  const hRecord = (path) => structuredClone(records.get(path))
  const publicMenu = () =>
    scopedTarget('directory-menu', 'main', {
      appId: 'app',
      kitchenId: 'guest-123',
      kitchenSlug: 'guest-123',
      rootKitchenData: hRecord('kitchens/guest-123'),
    })
  const read = (input) =>
    deps.readKitchenDocumentMenu(
      {},
      { kitchenId: 'guest-123', claimSecret: secret, ...input }
    )
  const save = async (content, input = {}) => {
    const current = await read()
    return saveKitchenDocumentMenu(
      {},
      {
        kitchenId: current.kitchenId,
        menuId: current.menuId,
        claimSecret: secret,
        revision: current.revision,
        venueName: 'TEST Café',
        publish: true,
        files: [
          {
            data: Buffer.from(content),
            fileName: 'menu.pdf',
            contentType: 'application/pdf',
          },
        ],
        ...input,
      }
    )
  }
  return {
    records,
    assets,
    removed,
    state,
    deps,
    read,
    save,
    start: () =>
      startGuestKitchen({}, { claim_secret: secret, name: 'TEST Café' }),
    saveCommand: saveKitchenDocumentMenu,
    children,
    publicMenu,
  }
}

test('free guest upload → publish → public file → reload → replace retains the exact Menu and QR', async () => {
  const h = fixture()
  await h.start()
  await assert.rejects(h.publicMenu(), /Menu not found/)
  const first = await h.save('%PDF-first-menu')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  assert.equal(first.status, 'published')
  assert.equal('previewUrl' in first, false)
  assert.equal('url' in first.document, false)
  assert.equal(first.venue, 'TEST Café')
  assert.equal((await h.publicMenu()).menuData.doc.url, firstUrl)
  assert.equal(
    h.children('kitchens/guest-123/menus').length,
    2,
    'uses the existing Main Menu'
  )
  assert.equal(
    [...h.records.keys()].some(
      (path) => path.startsWith('apps/') || path.startsWith('users/')
    ),
    false,
    'no account, request or payment record'
  )
  const url = new URL(first.menuPath, 'https://misebox.app').toString()
  const qr = await QRCode.toString(url, { type: 'svg' })
  assert.equal(
    h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc.url,
    firstUrl
  )
  const reloaded = await h.read()
  assert.equal(reloaded.revision, first.revision)
  assert.deepEqual(reloaded.document, first.document)
  const second = await h.save('%PDF-replacement-menu')
  const secondUrl = h.records.get(`kitchens/guest-123/menus/${second.menuId}`)
    .doc.url
  assert.equal(second.menuId, first.menuId)
  assert.equal(second.menuPath, first.menuPath)
  assert.equal(second.qrPath, first.qrPath)
  assert.notEqual(secondUrl, firstUrl)
  assert.equal((await h.publicMenu()).menuData.doc.url, secondUrl)
  assert.equal(
    await QRCode.toString(
      new URL(second.menuPath, 'https://misebox.app').toString(),
      { type: 'svg' }
    ),
    qr
  )
  assert.equal(
    [...h.assets.values()]
      .find(
        (asset) =>
          asset.url ===
          h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc.url
      )
      .bytes.toString(),
    '%PDF-replacement-menu'
  )
  assert.equal(h.children('kitchens/guest-123/menus').length, 2)
})

test('the private recovery proof works in a new browser identity without changing Menu identity', async () => {
  const h = fixture()
  await h.start()
  const first = await h.save('%PDF-first')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  h.state.uid = 'another-browser'
  assert.equal((await h.read()).menuId, first.menuId)
  assert.equal((await h.save('%PDF-updated')).qrPath, first.qrPath)
})

test('wrong recovery proof, cross-App proof and another Menu cannot write or upload', async () => {
  const h = fixture()
  await h.start()
  const before = structuredClone(h.records)
  await assert.rejects(
    h.read({ claimSecret: 'b'.repeat(64) }),
    /key is invalid/
  )
  const drinks = h
    .children('kitchens/guest-123/menus')
    .find((menu) => menu.data.slug === 'drinks')
  await assert.rejects(h.read({ menuId: drinks.id }), /another Menu/)
  h.state.appId = 'other-app'
  await assert.rejects(h.read(), /key is invalid/)
  assert.deepEqual(h.records, before)
  assert.equal(h.assets.size, 0)
})

test('adoption consumes guest authority; a retained key never bypasses current account access', async () => {
  const h = fixture()
  await h.start()
  await h.save('%PDF-first')
  h.records.get('kitchens/guest-123/claims/guest').claimed_by = 'owner'
  await assert.rejects(h.read(), /App membership/)
  h.state.uid = 'owner'
  h.state.anonymous = false
  const at = { seconds: 1, nanoseconds: 0 }
  h.records.set('apps/app/users/owner', {
    role: 'user',
    subscription: 'free',
    created: { at },
  })
  h.records.set('kitchen_access/owner', {
    apps: { app: { ids: ['guest-123'], membership_created_at: at } },
  })
  assert.equal((await h.save('%PDF-owned')).status, 'published')
  h.records.delete('kitchen_access/owner')
  await assert.rejects(h.read(), /association/)
})

test('revocation during upload removes only the unattached revision and retains the published file', async () => {
  const h = fixture()
  await h.start()
  const first = await h.save('%PDF-first')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  h.state.onUpload = () => {
    h.records.get('kitchens/guest-123/claims/guest').claimed_by = 'someone-else'
  }
  await assert.rejects(h.save('%PDF-denied'), /App membership/)
  assert.equal(h.assets.size, 1)
  assert.equal(h.removed.length, 1)
  assert.equal(
    h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc.url,
    firstUrl
  )
})

test('stale revisions, invalid files and structured Menu content fail without changing the public Menu', async () => {
  const h = fixture()
  await h.start()
  const first = await h.save('%PDF-first')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  await h.save('%PDF-second')
  const snapshot = structuredClone(h.records)
  await assert.rejects(
    h.save('%PDF-stale', { revision: first.revision }),
    /Menu changed/
  )
  await assert.rejects(h.save('not-a-pdf'), /Choose a PDF/)
  assert.deepEqual(h.records, snapshot)
  const menu = h.records.get(`kitchens/guest-123/menus/${first.menuId}`)
  menu.format = 'interactive'
  h.records.set(`kitchens/guest-123/menus/${first.menuId}/sections/s`, {
    label: 'Keep this content',
  })
  assert.equal((await h.read()).acceptsDocument, false)
  await assert.rejects(h.save('%PDF-do-not-overwrite'), /structured content/)
})

test('an empty Daily Menu cannot become a hosted document', async () => {
  const h = fixture()
  await h.start()
  const menu = await h.read()
  h.records.get(`kitchens/guest-123/menus/${menu.menuId}`).schedule = 'daily'
  assert.equal((await h.read()).acceptsDocument, false)
  await assert.rejects(h.save('%PDF-daily'), /Daily Menus/)
  assert.equal(h.assets.size, 0)
})

test('failed and uncertain commits preserve a recoverable, truthful document state', async () => {
  const h = fixture()
  await h.start()
  h.state.failCommit = true
  await assert.rejects(h.save('%PDF-failed'), /Commit failed/)
  assert.equal(h.assets.size, 0)
  assert.equal((await h.read()).status, 'draft')
  h.state.failCommit = false
  h.state.loseResponse = true
  await assert.rejects(h.save('%PDF-saved'), /Commit response lost/)
  assert.equal(h.assets.size, 1)
  assert.equal((await h.read()).status, 'published')
})

test('a replacement completed in another browser wins over an older upload still in progress', async () => {
  const h = fixture()
  await h.start()
  const first = await h.save('%PDF-original')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  let release, started
  const held = new Promise((resolve) => {
    release = resolve
  })
  const uploading = new Promise((resolve) => {
    started = resolve
  })
  let uploads = 0
  h.state.onUpload = async () => {
    if (++uploads === 1) {
      started()
      await held
    }
  }
  const older = h.save('%PDF-older-attempt')
  await uploading
  const winner = await h.save('%PDF-latest-accepted')
  const winnerUrl = h.records.get(`kitchens/guest-123/menus/${winner.menuId}`)
    .doc.url
  release()
  await assert.rejects(older, /Menu changed during upload/)
  assert.equal((await h.publicMenu()).menuData.doc.url, winnerUrl)
  assert.equal(winner.menuPath, first.menuPath)
  assert.equal(winner.qrPath, first.qrPath)
  assert.equal(h.removed.length, 1)
  assert.equal(h.assets.size, 2, 'retains the previous and accepted documents')
})

test('repeated document replacements retain one Menu identity and never create request or payment records', async () => {
  const h = fixture()
  await h.start()
  const first = await h.save('%PDF-original')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  for (let revision = 1; revision <= 30; revision++) {
    const result = await h.save(`%PDF-replacement-${revision}`)
    const resultUrl = h.records.get(`kitchens/guest-123/menus/${result.menuId}`)
      .doc.url
    assert.equal(result.menuId, first.menuId)
    assert.equal(result.menuPath, first.menuPath)
    assert.equal(result.qrPath, first.qrPath)
    assert.equal((await h.read()).revision, result.revision)
    assert.equal((await h.publicMenu()).menuData.doc.url, resultUrl)
  }
  assert.equal(h.children('kitchens/guest-123/menus').length, 2)
  assert.equal(
    [...h.records.keys()].some((path) => /^(apps|users)\//.test(path)),
    false
  )
})

test('unsupported, empty, multiple and oversized uploads leave the published file intact', async () => {
  const h = fixture()
  await h.start()
  const first = await h.save('%PDF-original')
  const firstUrl = h.records.get(`kitchens/guest-123/menus/${first.menuId}`).doc
    .url
  const file = (data, contentType = 'application/pdf') => ({
    data: Buffer.from(data),
    contentType,
    fileName: 'menu.pdf',
  })
  const oversized = Buffer.alloc(10 * 1024 * 1024 + 1)
  oversized.write('%PDF-')
  for (const files of [
    [],
    [file('%PDF-one'), file('%PDF-two')],
    [file('')],
    [file('a document without PDF bytes')],
    [file('%PDF-wrong-type', 'text/plain')],
    [file('%PDF-wrong-type', 'image/png')],
    [file(oversized)],
  ]) {
    await assert.rejects(h.save('', { files }), /Choose/)
    assert.equal((await h.publicMenu()).menuData.doc.url, firstUrl)
    assert.equal(h.assets.size, 1)
    assert.equal(h.removed.length, 0)
  }
})

test('Workspace uses the same file command on Free and its ordinary publication owner without currency', async () => {
  const h = fixture()
  await h.start()
  h.records.get('kitchens/guest-123/claims/guest').claimed_by = 'owner'
  h.state.uid = 'owner'
  h.state.anonymous = false
  const at = { seconds: 1, nanoseconds: 0 }
  h.records.set('apps/app/users/owner', {
    role: 'user',
    subscription: 'free',
    created: { at },
  })
  h.records.set('kitchen_access/owner', {
    apps: { app: { ids: ['guest-123'], membership_created_at: at } },
  })
  const selected = await h.read({ claimSecret: undefined })
  const draft = await h.saveCommand(
    {},
    {
      kitchenId: selected.kitchenId,
      menuId: selected.menuId,
      files: [
        {
          data: Buffer.from('%PDF-workspace'),
          fileName: 'workspace.pdf',
          contentType: 'application/pdf',
        },
      ],
    }
  )
  assert.equal(draft.status, 'draft')
  assert.equal('previewUrl' in draft, false)
  assert.equal('url' in draft.document, false)
  const draftUrl = h.records.get(`kitchens/guest-123/menus/${draft.menuId}`).doc
    .url
  await h.deps.runGuardedServerTransaction({}, (tx) =>
    h.deps.stagePublishKitchenMenu(tx, {
      appId: 'app',
      kitchenId: draft.kitchenId,
      menuId: draft.menuId,
      uid: 'owner',
    })
  )
  assert.equal((await h.publicMenu()).menuData.doc.url, draftUrl)
  assert.equal(h.records.get('apps/app/users/owner').subscription, 'free')
  assert.equal(h.children('kitchens/guest-123/menus').length, 2)
})

test('account readers choose an active Menu when Main is archived; guest proof remains bound to Main', async () => {
  const h = fixture()
  await h.start()
  const menus = h.children('kitchens/guest-123/menus')
  const main = menus.find((menu) => menu.data.slug === 'main')
  const drinks = menus.find((menu) => menu.data.slug === 'drinks')
  h.records.get(`kitchens/guest-123/menus/${main.id}`).status = 'archived'
  await assert.rejects(h.read(), /Choose an active/)
  h.records.get('kitchens/guest-123/claims/guest').claimed_by = 'owner'
  h.state.uid = 'owner'
  h.state.anonymous = false
  const at = { seconds: 1, nanoseconds: 0 }
  h.records.set('apps/app/users/owner', {
    role: 'user',
    subscription: 'free',
    created: { at },
  })
  h.records.set('kitchen_access/owner', {
    apps: { app: { ids: ['guest-123'], membership_created_at: at } },
  })
  assert.equal((await h.read({ claimSecret: undefined })).menuId, drinks.id)
  h.records.get(`kitchens/guest-123/menus/${drinks.id}`).status = 'archived'
  await assert.rejects(h.read({ claimSecret: undefined }), /Choose an active/)
})
