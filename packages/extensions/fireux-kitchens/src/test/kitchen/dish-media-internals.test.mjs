import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, dependencies, name = 'handler') {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export default /gm, 'const handler = ')
    .replace(/^export /gm, '')
  return compileFunction(
    stripTypeScriptTypes(source) + '; return ' + name,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
const createError = (input) =>
  Object.assign(new Error(input.statusMessage), input)
const readString = (value) => (typeof value === 'string' ? value.trim() : '')
const target = (path) => ({ collectionPath: path })
const pathOf = (value, id) => value.collectionPath + '/' + id
const serverKitchenDishesTarget = (id) => target('kitchens/' + id + '/dishes')
const serverAppUsersTarget = (id) => target('apps/' + id + '/users')
const serverKitchenAccessTarget = () => target('kitchen_access')
const KITCHEN_MUTATION_TARGETS = { kitchens: target('kitchens') }
const readMembershipAccessIds = load(
  '../../../../../core/fireux-core/src/runtime/app/utils/membership-access.ts',
  {},
  'readMembershipAccessIds'
)
const readKitchenAccessIds = load(
  '../../runtime/kitchen/utils/kitchen-access.ts',
  { readMembershipAccessIds, KITCHEN_USER_LIMIT: 500 },
  'readKitchenAccessIds'
)

function harness(options = {}) {
  const at = { seconds: 1, nanoseconds: 0 }
  const dishPath = 'kitchens/k/dishes/d'
  const records = new Map([
    ['apps/app/users/u', { role: 'user', created: { at } }],
    ['kitchens/k', {}],
    [
      'kitchen_access/u',
      { apps: { app: { ids: ['k'], membership_created_at: at } } },
    ],
    [
      dishPath,
      { name: 'Dish', kitchen_id: 'k', image: 'before', is_flagship: false },
    ],
  ])
  const writes = [],
    reads = [],
    queryPages = []
  let cleaned = 0,
    uploaded = 0,
    rootGets = 0
  const snapshot = (path) => ({
    id: path.split('/').at(-1),
    exists: records.has(path),
    ref: doc(path),
    data: () =>
      records.has(path) ? structuredClone(records.get(path)) : undefined,
    get: (key) => records.get(path)?.[key],
  })
  const doc = (path) => ({
    path,
    async get() {
      rootGets++
      if (rootGets > 1 && options.recoveryUnreadable)
        throw new Error('unreadable recovery')
      return snapshot(path)
    },
  })
  const matching = (collectionPath, field, value) =>
    [...records.entries()]
      .filter(
        ([path, data]) =>
          path.startsWith(collectionPath + '/') &&
          path.split('/').length === collectionPath.split('/').length + 1 &&
          data[field] === value
      )
      .sort(([left], [right]) => left.localeCompare(right))
  async function transaction(run, raw = false) {
    options.beforeTransaction?.(records)
    let writing = false
    const pending = []
    const read = async (value, id) => {
      assert.equal(writing, false, 'all reads precede the first write')
      const path = pathOf(value, id)
      reads.push(path)
      return {
        exists: records.has(path),
        data: records.has(path)
          ? structuredClone(records.get(path))
          : undefined,
      }
    }
    const tx = {
      read,
      query: async (value, query) => {
        assert.equal(writing, false, 'query pages are read before writes')
        const rows = matching(value.collectionPath, query.field, query.value)
          .filter(
            ([path]) =>
              !query.afterId ||
              path.split('/').at(-1).localeCompare(query.afterId) > 0
          )
          .slice(0, query.limit)
          .map(([path, data]) => ({
            id: path.split('/').at(-1),
            data: structuredClone(data),
          }))
        queryPages.push(rows.map((row) => row.id))
        return rows
      },
      update: (value, id, data) => {
        writing = true
        pending.push([raw ? value.path : pathOf(value, id), raw ? id : data])
      },
      get: async (value) => {
        assert.equal(writing, false)
        if (value.path) return snapshot(value.path)
        return {
          docs: matching(value.collectionPath, value.field, value.value).map(
            ([path]) => snapshot(path)
          ),
        }
      },
    }
    const result = await run(tx)
    if (options.outcome === 'reject')
      throw createError({ statusCode: 409, statusMessage: 'commit rejected' })
    for (const [path, data] of pending) {
      records.set(path, { ...records.get(path), ...data })
      writes.push([path, data])
    }
    if (options.outcome === 'interrupted')
      throw new Error('response interrupted after commit')
    return result
  }
  const db = {
    doc,
    getAll: async (...refs) => refs.map((ref) => snapshot(ref.path)),
    collection: (collectionPath) => ({
      doc: (id) => doc(collectionPath + '/' + id),
      where: (field, op, value) => ({ collectionPath, field, value }),
    }),
    runTransaction: (run) => transaction(run, true),
  }
  const access = load(
    '../../runtime/kitchen/server/core/operator-access.ts',
    {
      createError,
      getRuntimeFirestore: () => db,
      readKitchenAccessIds,
      KITCHEN_MUTATION_TARGETS,
      serverAppUsersTarget,
      serverKitchenAccessTarget,
      requireFirebaseBearerUser: async () => {
        options.duringCredentials?.(records)
        return { uid: 'u' }
      },
    },
    '({ requireKitchenWriter, requireKitchenWriterAccount })'
  )
  const deps = {
    ...access,
    createError,
    readString,
    serverKitchenDishesTarget,
    runGuardedServerTransaction: async (_, run) => transaction(run),
    DishStorage: { collection: 'dishes' },
    serverAuditStamp: (value) => value,
    defineEventHandler: (handler) => handler,
    useRuntimeConfig: () => ({ public: { fireux: { id: 'app' } } }),
    requirePathSegment: (value) => {
      if (typeof value !== 'string' || !value || value.includes('/'))
        throw createError({ statusCode: 400 })
      return value
    },
    getQuery: () => ({ kitchenId: 'k' }),
    getRouterParam: () => 'd',
    readBody: async (event) => event.body,
    readMultipartFormData: async () => [],
    readUploadedMultipartFile: () => ({ data: Buffer.from('image') }),
    normalizeAndSaveDishImage: async () => {
      uploaded++
      options.duringUpload?.(records)
      return {
        imageUrl: 'saved',
        objectPath: 'immutable-object',
        deleteUploaded: async () => {
          cleaned++
          if (options.cleanupError) throw new Error('cleanup failed')
        },
      }
    },
    setResponseHeaders() {},
  }
  return {
    image: load(
      '../../runtime/server/api/workspace/kitchen/dishes/[dishId]/image.post.ts',
      deps
    ),
    flagship: load(
      '../../runtime/server/api/workspace/kitchen/dishes/[dishId]/flagship.patch.ts',
      deps
    ),
    records,
    writes,
    reads,
    queryPages,
    dishPath,
    get cleaned() {
      return cleaned
    },
    get uploaded() {
      return uploaded
    },
  }
}

test('image attachment accepts canonical path identity without a duplicated stored id', async () => {
  const h = harness()
  assert.equal('id' in h.records.get(h.dishPath), false)
  assert.deepEqual(await h.image({}), {
    ok: true,
    dish_id: 'd',
    image: 'saved',
    object_path: 'immutable-object',
  })
  assert.equal(h.records.get(h.dishPath).image, 'saved')
  assert.equal(h.cleaned, 0)
  assert.deepEqual(h.writes[0][1].updated, { by: 'u' })
})

test('media and flagship reject missing or foreign Kitchen documents', async () => {
  for (const action of ['image', 'flagship'])
    for (const state of ['empty', 'foreign']) {
      const h = harness()
      if (state === 'empty') h.records.delete(h.dishPath)
      else h.records.get(h.dishPath).kitchen_id = 'other'
      await assert.rejects(h[action]({ body: { is_flagship: true } }), {
        statusCode: state === 'empty' ? 404 : 409,
      })
      assert.equal(h.writes.length, 0)
      assert.equal(h.uploaded, 0)
    }
})

test('image commit rechecks exact membership lifetime, access and Kitchen after upload', async () => {
  for (const revoke of [
    (records) => records.delete('apps/app/users/u'),
    (records) => {
      records.get('apps/app/users/u').created.at = {
        seconds: 2,
        nanoseconds: 0,
      }
    },
    (records) => {
      records.get('kitchen_access/u').apps.app.ids = []
    },
    (records) => records.delete('kitchen_access/u'),
    (records) => records.delete('kitchens/k'),
  ]) {
    const h = harness({ duringUpload: revoke })
    await assert.rejects(h.image({}))
    assert.equal(h.writes.length, 0)
    assert.equal(h.records.get(h.dishPath).image, 'before')
    assert.equal(h.cleaned, 1)
  }
})

test('image conflict or rejected pointer commit cleans only its unreferenced upload', async () => {
  for (const options of [
    {
      duringUpload: (records) => {
        records.get('kitchens/k/dishes/d').image = 'newer'
      },
    },
    { outcome: 'reject' },
  ]) {
    const h = harness(options)
    await assert.rejects(h.image({}), { statusCode: 409 })
    assert.equal(h.writes.length, 0)
    assert.equal(h.cleaned, 1)
    assert.equal(
      h.records.get(h.dishPath).image,
      options.duringUpload ? 'newer' : 'before'
    )
  }
})

test('image interrupted commit stays truthful and unknown outcome retains its upload', async () => {
  const committed = harness({ outcome: 'interrupted' })
  assert.equal((await committed.image({})).image, 'saved')
  assert.equal(committed.cleaned, 0)
  assert.equal(committed.writes.length, 1)
  const unknown = harness({ outcome: 'interrupted', recoveryUnreadable: true })
  await assert.rejects(unknown.image({}), /outcome could not be confirmed/)
  assert.equal(unknown.cleaned, 0)
  assert.equal(unknown.records.get(unknown.dishPath).image, 'saved')
  const cleanup = harness({ outcome: 'reject', cleanupError: true })
  await assert.rejects(
    cleanup.image({}),
    /unreferenced upload could not be removed/
  )
  assert.equal(cleanup.records.get(cleanup.dishPath).image, 'before')
})

test('flagship accepts only the exact boolean envelope and detaches it before credentials', async () => {
  for (const body of [
    null,
    [],
    {},
    { is_flagship: null },
    { is_flagship: 'true' },
    { is_flagship: 1 },
    { is_flagship: true, image: 'changed' },
  ]) {
    const h = harness()
    await assert.rejects(h.flagship({ body }), { statusCode: 400 })
    assert.equal(h.writes.length, 0)
  }
  const body = { is_flagship: true }
  const h = harness({
    duringCredentials: () => {
      body.is_flagship = false
    },
  })
  assert.equal((await h.flagship({ body })).is_flagship, true)
  assert.equal(h.records.get(h.dishPath).is_flagship, true)
})

test('flagship rechecks current writer authority before promotion or removal', async () => {
  for (const is_flagship of [false, true])
    for (const revoke of [
      (records) => records.delete('apps/app/users/u'),
      (records) => {
        records.get('apps/app/users/u').created.at = {
          seconds: 2,
          nanoseconds: 0,
        }
      },
      (records) => {
        records.get('kitchen_access/u').apps.app.ids = []
      },
      (records) => records.delete('kitchens/k'),
    ]) {
      const h = harness({ beforeTransaction: revoke })
      await assert.rejects(h.flagship({ body: { is_flagship } }))
      assert.equal(h.writes.length, 0)
    }
})

test('flagship promotion reads every existing page before clearing other flags atomically', async () => {
  const h = harness()
  for (let i = 0; i < 103; i++)
    h.records.set('kitchens/k/dishes/old-' + String(i).padStart(3, '0'), {
      kitchen_id: 'k',
      is_flagship: true,
    })
  await h.flagship({ body: { is_flagship: true } })
  assert.deepEqual(
    h.queryPages.map((page) => page.length),
    [100, 3]
  )
  assert.equal(h.writes.length, 104)
  assert.equal(
    [...h.records.values()].filter((row) => row.is_flagship === true).length,
    1
  )
  assert.equal(h.records.get(h.dishPath).is_flagship, true)
  h.writes.length = 0
  h.queryPages.length = 0
  await h.flagship({ body: { is_flagship: false } })
  assert.equal(h.writes.length, 1)
  assert.equal(h.queryPages.length, 0)
  assert.equal(
    [...h.records.values()].filter((row) => row.is_flagship === true).length,
    0
  )
})
