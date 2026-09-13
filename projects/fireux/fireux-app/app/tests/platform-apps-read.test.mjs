import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function load(path, name, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

function harness({ failedSource = '' } = {}) {
  const queries = []
  const records = {
    first: [
      { id: 'a', status: 'active', ecosystem_id: 'one' },
      { id: 'c', status: 'active', ecosystem_id: 'one' },
      { id: 'e', status: 'active', ecosystem_id: 'one' },
    ],
    second: [
      { id: 'b', status: 'active', ecosystem_id: 'two' },
      { id: 'd', status: 'inactive', ecosystem_id: 'two' },
      { id: 'f', status: 'active', ecosystem_id: 'two' },
    ],
    identity: [
      { id: 'one', project_id: 'selected' },
      { id: 'two', project_id: 'other' },
    ],
  }
  const database = (name) => ({
    collection(collection) {
      let rows = records[name]
      const operations = [name, collection]
      queries.push(operations)
      const query = {
        where(field, operator, value) {
          operations.push(['where', field, operator, value])
          rows = rows.filter((row) => row[field] === value)
          return query
        },
        orderBy() {
          rows = [...rows].sort((a, b) => (a.id < b.id ? -1 : 1))
          return query
        },
        startAfter(id) {
          operations.push(['cursor', id])
          rows = rows.filter((row) => row.id > id)
          return query
        },
        limit(count) {
          operations.push(['limit', count])
          rows = rows.slice(0, count)
          return query
        },
        async get() {
          if (name === failedSource) throw new Error('Source unavailable')
          return { docs: rows.map((row) => ({ id: row.id, data: () => row })) }
        },
      }
      return query
    },
  })
  const createError = (input) =>
    Object.assign(new Error(input.statusMessage), input)
  const dependencies = {
    createError,
    FieldPath: { documentId: () => '__name__' },
    readAppDocument: (data, id) => ({ ...data, id }),
  }
  const path =
    '../../../../../packages/core/fireux-core/src/runtime/app/server/collection/read.ts'
  const read = load('../../server/utils/apps.ts', 'readPlatformAppCollection', {
    createError,
    readAppRecords: load(path, 'readAppRecords', dependencies),
    readAppPageInput: load(path, 'readAppPageInput', dependencies),
    appCollectionPage: load(path, 'appCollectionPage', dependencies),
    PLATFORM_DIRECTORY_TARGETS: [
      { ecosystemId: 'one', projectId: 'firebase-one', databaseId: 'first' },
      { ecosystemId: 'two', projectId: 'firebase-two', databaseId: 'second' },
    ],
    readPlatformEcosystems: async () => records.identity,
    getFirestoreProjectDb: async (_project, name) => database(name),
  })
  return { read, queries }
}

test('Public App pages merge bounded source queries without gaps or inactive Apps', async () => {
  const { read, queries } = harness()
  const first = await read({ limit: '2' })
  const second = await read({ limit: '2', cursor: first.nextCursor })
  const last = await read({ limit: '2', cursor: second.nextCursor })
  assert.deepEqual(
    [first, second, last].map((page) => page.items.map((app) => app.id)),
    [['a', 'b'], ['c', 'e'], ['f']]
  )
  assert.equal(last.nextCursor, null)
  for (const query of queries) {
    assert.ok(
      query.some((op) => Array.isArray(op) && op[0] === 'limit' && op[1] === 3)
    )
    assert.ok(
      query.some(
        (op) =>
          Array.isArray(op) &&
          op[0] === 'where' &&
          op[1] === 'status' &&
          op[3] === 'active'
      )
    )
  }
})

test('Project reads resolve only their Ecosystems and query Apps at source', async () => {
  const { read, queries } = harness()
  const page = await read({ projectId: 'selected' })
  assert.deepEqual(
    page.items.map((app) => app.id),
    ['a', 'c', 'e']
  )
  assert.equal(page.nextCursor, null)
  assert.deepEqual(queries, [
    [
      'first',
      'apps',
      ['where', 'ecosystem_id', '==', 'one'],
      ['where', 'status', '==', 'active'],
    ],
  ])
})

test('Ecosystem reads exclude inactive Apps and do not query unrelated sources', async () => {
  const { read, queries } = harness()
  const page = await read({ ecosystemId: 'two' })
  assert.deepEqual(
    page.items.map((app) => app.id),
    ['b', 'f']
  )
  assert.deepEqual(queries, [
    [
      'second',
      'apps',
      ['where', 'ecosystem_id', '==', 'two'],
      ['where', 'status', '==', 'active'],
    ],
  ])
})

test('Empty Project relationships do not fall back to the general directory', async () => {
  const { read, queries } = harness()
  assert.deepEqual((await read({ projectId: 'missing' })).items, [])
  assert.equal(queries.length, 0)
})

test('Failed sources cannot issue a cursor that skips their Apps', async () => {
  await assert.rejects(
    harness({ failedSource: 'second' }).read({ limit: 2 }),
    /Source unavailable/
  )
})

test('Ambiguous and malformed parents fail before querying', async () => {
  const { read, queries } = harness()
  for (const input of [
    { projectId: 'a', ecosystemId: 'b' },
    { ecosystemId: ['one'] },
    { projectId: 'a/b' },
  ]) {
    await assert.rejects(read(input), (error) => error.statusCode === 400)
  }
  assert.equal(queries.length, 0)
})

test('Public App detail excludes inactive and archived definitions', async () => {
  for (const status of ['active', 'inactive', 'archived']) {
    const read = load('../../server/utils/apps.ts', 'readPlatformApp', {
      PLATFORM_DIRECTORY_TARGETS: [{ projectId: 'host', databaseId: 'apps' }],
      getFirestoreProjectDb: async () => ({
        collection: () => ({
          doc: (id) => ({
            get: async () => ({ exists: true, id, data: () => ({ status }) }),
          }),
        }),
      }),
      readAppDocument: (data, id) => ({ ...data, id }),
    })
    assert.deepEqual(
      await read('example'),
      status === 'active' ? { id: 'example', status } : null
    )
  }
})

test('Complete App reads report the correct failed source while retaining available Apps', async () => {
  const warnings = []
  const targets = ['first', 'second', 'third'].map((key) => ({
    key,
    projectId: key,
  }))
  const read = load('../../server/utils/apps.ts', 'readPlatformApps', {
    PLATFORM_DIRECTORY_TARGETS: targets,
    getFirestoreProjectDb: async (project) => ({
      collection: () => ({
        get: async () => {
          if (project === 'second') throw new Error('Unavailable')
          return { docs: [{ id: project, data: () => ({ status: 'active' }) }] }
        },
      }),
    }),
    readAppDocument: (data, id) => ({ ...data, id }),
    console: { warn: (...args) => warnings.push(args) },
  })
  assert.deepEqual(
    (await read()).map((app) => app.id),
    ['first', 'third']
  )
  assert.deepEqual(warnings[0][1], [
    { target: 'second', reason: 'Unavailable' },
  ])
})

test('Complete App reads fail when every configured source is unavailable', async () => {
  const read = load('../../server/utils/apps.ts', 'readPlatformApps', {
    PLATFORM_DIRECTORY_TARGETS: [{ key: 'first', projectId: 'first' }],
    getFirestoreProjectDb: async () => {
      throw new Error('Unavailable')
    },
  })
  await assert.rejects(
    read,
    (error) => error instanceof AggregateError && error.errors.length === 1
  )
})


test('Platform Ecosystem detail selects the owning named database and rejects unknown targets', async () => {
  const calls = []
  const read = load('../../server/utils/ecosystems.ts', 'readPlatformEcosystem', {
    createError: input => Object.assign(new Error(input.statusMessage), input),
    PLATFORM_DIRECTORY_TARGETS: [{ ecosystemId: 'misebox', projectId: 'misebox-project', databaseId: 'misebox' }],
    getFirestoreProjectDb: async (...args) => { calls.push(args); return 'owner-db' },
    readEcosystem: async (id, db) => { assert.equal(db, 'owner-db'); return { id, project_id: 'misebox' } },
  })
  assert.equal((await read('misebox')).id, 'misebox')
  assert.deepEqual(calls, [['misebox-project', 'misebox']])
  await assert.rejects(read('arbitrary-db'), error => error.statusCode === 404)
  assert.equal(calls.length, 1)
})
