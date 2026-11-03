import assert from 'node:assert/strict'
import test from 'node:test'
import { computed, ref, reactive, watch, effectScope } from 'vue'
import { useCommandScope } from '../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { loadOfferingSource as load } from './offering-test-helpers.mjs'

const createError = (value) =>
  Object.assign(new Error(value.statusMessage), value)
const metadata = load(
  'menu/utils/records/metadata',
  'normalizeMenuMetadataPatch,normalizeMenuDocument'
)
const createInput = load(
  'menu/utils/records/create-input',
  'normalizeMenuCreateInput,buildMenuPayload',
  metadata
)
const sourcePath = 'kitchens/k/menu-uploads/source'
function server() {
  const rows = new Map([
    [
      sourcePath,
      {
        input_fingerprint: 'original',
        files: [
          {
            file_name: 'menu.pdf',
            file_type: 'application/pdf',
            storage_path: `${sourcePath}/source/1-menu.pdf`,
          },
        ],
      },
    ],
  ])
  const saved = [],
    deleted = []
  let allowed = true,
    tier = 'premium',
    beforeCommit = () => {},
    afterDownload = () => {},
    failCommit = false,
    loseCommitResponse = false
  const transaction = async (_, work) => {
    const writes = []
    let writing = false
    const tx = {
      read: async (target, id) => {
        assert.equal(writing, false)
        return {
          exists: rows.has(`${target}/${id}`),
          data: structuredClone(rows.get(`${target}/${id}`)),
        }
      },
      create: (target, id, data) => {
        writing = true
        writes.push(() => {
          assert.equal(rows.has(`${target}/${id}`), false)
          rows.set(`${target}/${id}`, data)
        })
      },
      update: (target, id, data) => {
        writing = true
        writes.push(() =>
          rows.set(`${target}/${id}`, {
            ...rows.get(`${target}/${id}`),
            ...data,
          })
        )
      },
    }
    const result = await work(tx)
    if (writes.length) beforeCommit()
    if (writes.length && failCommit) throw Error('Commit failed')
    writes.forEach((write) => write())
    if (writes.length && loseCommitResponse) {
      loseCommitResponse = false
      throw Error('Commit response lost')
    }
    return result
  }
  const authority = async () => {
    if (!allowed)
      throw createError({ statusCode: 403, statusMessage: 'Access revoked' })
  }
  const deps = {
    createError,
    ...createInput,
    requireFirestoreDocumentId: (value) => {
      if (typeof value !== 'string' || !value || value.includes('/'))
        throw Error('Invalid id')
      return value
    },
    menuNameAndSlug: (_, name) => {
      if (typeof name !== 'string' || !name.trim()) throw Error('Invalid name')
      return { name: name.trim(), slug: name.toLowerCase().trim() }
    },
    readKitchenMutationActor: async () => ({
      uid: 'operator',
      runtimeAppId: 'app',
    }),
    requireKitchenMutationAuthority: authority,
    runGuardedServerTransaction: transaction,
    serverKitchenMenuUploadsTarget: (kitchen) =>
      `kitchens/${kitchen}/menu-uploads`,
    serverKitchenMenusTarget: (kitchen) => `kitchens/${kitchen}/menus`,
    requireMenuCreationCapacity: async () => {
      await authority()
      return { subscription: tier, placeData: { default_currency_code: 'CHF' } }
    },
    readPlaceCurrencyCode: (data) => data.default_currency_code,
    requireAvailableMenuSlug: async (_, kitchen, slug) => {
      if (
        [...rows].some(
          ([path, row]) =>
            path.startsWith(`kitchens/${kitchen}/menus/`) && row.slug === slug
        )
      )
        throw Error('Menu path exists')
    },
    serverAuditStamp: (data) => ({ ...data, at: 'now' }),
    randomUUID: () => `revision-${saved.length + 1}`,
    downloadStorageFile: async ({ objectPath }) => {
      assert.equal(objectPath, `${sourcePath}/source/1-menu.pdf`)
      afterDownload()
      return { buffer: Buffer.from('%PDF-test') }
    },
    saveKitchenMenuUploadFiles: async (input) => {
      saved.push(input)
      return [
        {
          fileUrl: `https://files.example/${input.uploadId}.pdf`,
          fileName: 'menu.pdf',
          contentType: 'application/pdf',
          objectPath: `kitchens/k/menu-uploads/${input.uploadId}/source/1-menu.pdf`,
        },
      ]
    },
    deleteStorageFileIfExists: async (value) => deleted.push(value.objectPath),
  }
  Object.assign(
    deps,
    load('menu/server/records/create', 'stageCreateKitchenMenu', deps)
  )
  const command = load(
    'menu/server/source/document',
    'createKitchenMenuDocumentFromSource',
    deps
  ).createKitchenMenuDocumentFromSource
  const structured = load('menu/server/draft/write', 'writeKitchenMenuDraft', {
    ...deps,
    MenuStorage: { scopeCollection: 'menus' },
    getRuntimeFirestore: () => ({
      doc: () => ({ collection: () => ({ get: async () => ({ docs: [] }) }) }),
    }),
    planKitchenMenuDraft: () => ({
      plannedSections: [],
      sproochliCacheUnits: [],
    }),
    serverKitchenDishesTarget: (kitchen) => `kitchens/${kitchen}/dishes`,
  }).writeKitchenMenuDraft
  return {
    rows,
    saved,
    deleted,
    prepare: (input) =>
      command(
        {},
        { kitchenId: 'k', sourceId: 'source', name: 'Food', ...input }
      ),
    revoke: () => {
      allowed = false
    },
    tier: (value) => {
      tier = value
    },
    afterDownload: (callback) => {
      afterDownload = callback
    },
    fail: () => {
      failCommit = true
    },
    loseResponse: () => {
      loseCommitResponse = true
    },
    applyStructured: () =>
      structured({
        appId: 'app',
        kitchenId: 'k',
        kitchenPath: 'kitchens/k',
        menuId: 'source',
        uid: 'operator',
        actor: { uid: 'operator', runtimeAppId: 'app' },
        sections: [],
      }),
  }
}

test('one saved source creates a draft document through the shared Menu creation policy; retry creates nothing', async () => {
  const h = server()
  const result = await h.prepare()
  assert.equal(result.id, 'source')
  const menu = h.rows.get('kitchens/k/menus/source')
  assert.equal(menu.status, 'draft')
  assert.equal(menu.format, 'document')
  assert.equal(menu.doc.url, 'https://files.example/revision-1.pdf')
  assert.notEqual(
    menu.doc.storage_path,
    h.rows.get(sourcePath).files[0].storage_path
  )
  assert.equal(h.rows.get(sourcePath).menu_id, 'source')
  assert.equal((await h.prepare()).created, false)
  assert.equal(h.saved.length, 1)
  assert.equal(
    [...h.rows].some(([path]) => path.includes('/dishes/')),
    false
  )
})

test('multiple files, URL sources and foreign objects cannot silently become a single document Menu', async () => {
  for (const change of [
    (source) => {
      source.files.push({ ...source.files[0] })
    },
    (source) => {
      source.files = []
    },
    (source) => {
      source.files[0].storage_path = 'kitchens/other/file.pdf'
    },
  ]) {
    const h = server()
    change(h.rows.get(sourcePath))
    await assert.rejects(h.prepare(), /one PDF|does not belong/)
    assert.equal(h.saved.length, 0)
    assert.equal(h.rows.has('kitchens/k/menus/source'), false)
  }
})

test('source changes and access revocation during storage stop attachment and remove the unattached revision', async () => {
  for (const change of [
    (h) => {
      h.rows.get(sourcePath).input_fingerprint = 'changed'
    },
    (h) => h.revoke(),
  ]) {
    const h = server()
    h.afterDownload(() => change(h))
    await assert.rejects(h.prepare(), /source changed|revoked/)
    assert.equal(h.rows.has('kitchens/k/menus/source'), false)
    assert.equal(h.rows.get(sourcePath).menu_id, undefined)
    assert.equal(h.deleted.length, 1)
  }
})

test('failed transactions leave the source unlinked and remove the unattached file', async () => {
  const h = server()
  h.fail()
  await assert.rejects(h.prepare(), /Commit failed/)
  assert.equal(h.rows.has('kitchens/k/menus/source'), false)
  assert.equal(h.rows.get(sourcePath).menu_id, undefined)
  assert.equal(h.deleted.length, 1)
})

test('an uncertain commit retains an attached document and retry resolves its original Menu', async () => {
  const h = server()
  h.loseResponse()
  await assert.rejects(h.prepare(), /Commit response lost/)
  assert.equal(h.rows.get(sourcePath).menu_id, 'source')
  assert.equal(h.deleted.length, 0)
  assert.equal((await h.prepare()).created, false)
  assert.equal(h.saved.length, 1)
})

test('another preparation and an existing Menu path are never overwritten', async () => {
  const h = server()
  h.rows.get(sourcePath).menu_id = 'other'
  await assert.rejects(h.prepare(), /another Menu preparation/)
  assert.equal(h.saved.length, 0)
  delete h.rows.get(sourcePath).menu_id
  h.rows.set('kitchens/k/menus/existing', { slug: 'food' })
  await assert.rejects(h.prepare(), /Menu path exists/)
  assert.equal(h.deleted.length, 1)
  assert.equal(h.rows.has('kitchens/k/menus/source'), false)
})

test('document preparation keeps shared Free naming policy and does not grant a paid tier', async () => {
  const h = server()
  h.tier('free')
  await assert.rejects(h.prepare({ name: 'Custom' }), /Custom Menu names/)
  assert.equal(h.rows.has('kitchens/k/menus/source'), false)
  await h.prepare({ name: 'Food' })
  assert.equal(h.rows.get('kitchens/k/menus/source').name, 'Food')
})

test('structured import cannot overwrite a document Menu or create Dishes behind its document', async () => {
  const h = server()
  await h.prepare()
  const before = structuredClone(h.rows.get('kitchens/k/menus/source'))
  await assert.rejects(h.applyStructured(), /document Menu/)
  assert.deepEqual(h.rows.get('kitchens/k/menus/source'), before)
})

function client() {
  let resolve
  const token = new Promise((done) => {
    resolve = done
  })
  const scope = effectScope(),
    currentUser = ref({ uid: 'operator', getIdToken: () => token })
  const context = {
    kitchenId: ref('k'),
    menuId: ref('source'),
    activeKitchenAppId: ref('app'),
    canWrite: ref(true),
    menu: ref(null),
    source: ref({ files: [{ file_name: 'menu.pdf' }], file_url: 'original' }),
  }
  const route = reactive({ fullPath: '/menus/prepare' }),
    appUser = ref({ role: 'user' }),
    calls = [],
    opened = [],
    selected = []
  const deps = {
    computed,
    ref,
    watch,
    useCommandScope,
    useRoute: () => route,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => ({ appId: 'app' }),
    useUserSession: () => ({ appUser }),
    useWorkspace: () => ({ select: (id) => selected.push(id) }),
    navigateTo: (path) => opened.push(path),
    $fetch: async (...args) => {
      calls.push(args)
      return { id: 'source', kitchenId: 'k' }
    },
  }
  Object.assign(
    deps,
    load('menu/composables/useMenuEditorScope', 'useMenuEditorScope', deps)
  )
  const document = scope.run(() =>
    load(
      'kitchen/composables/menu/useMenuDocumentPreparation',
      'useMenuDocumentPreparation',
      deps
    ).useMenuDocumentPreparation(context)
  )
  return {
    document,
    context,
    currentUser,
    appUser,
    route,
    calls,
    opened,
    selected,
    scope,
    resolve,
  }
}

test('document preparation stops obsolete account, membership, route, target and source continuations', async () => {
  for (const change of [
    (h) => {
      h.currentUser.value = null
    },
    (h) => {
      h.appUser.value = null
    },
    (h) => {
      h.route.fullPath = '/elsewhere'
    },
    (h) => {
      h.context.kitchenId.value = 'other'
    },
    (h) => {
      h.context.canWrite.value = false
    },
    (h) => {
      h.context.source.value.file_url = 'changed'
    },
    (h) => h.scope.stop(),
  ]) {
    const h = client(),
      pending = h.document.prepare()
    change(h)
    h.resolve('token')
    await pending
    assert.equal(h.calls.length, 0)
    h.scope.stop()
  }
})

test('opening the created Menu explicitly selects its actual Kitchen before navigating', async () => {
  const h = client(),
    pending = h.document.prepare()
  h.resolve('token')
  await pending
  assert.equal(h.calls[0][0], '/api/workspace/kitchen/menus/source-document')
  assert.deepEqual(h.calls[0][1].body, {
    kitchenId: 'k',
    sourceId: 'source',
    name: 'Main',
  })
  h.context.menu.value = { format: 'document', slug: 'food' }
  h.document.openMenu()
  assert.deepEqual(h.selected, ['k'])
  assert.deepEqual(h.opened, ['/workspace/kitchen/food-and-drink/menus/food'])
  h.scope.stop()
})
