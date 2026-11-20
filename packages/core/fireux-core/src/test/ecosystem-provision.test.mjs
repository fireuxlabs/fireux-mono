import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import test from 'node:test'
import { compileFunction } from 'node:vm'
import { createError } from 'h3'
import { ECOSYSTEM_STATUSES } from '../runtime/ecosystem/models/ecosystem.model.ts'
import { toEcosystemDirectoryEntry } from '../runtime/ecosystem/server/directory/projection.ts'
import { requireFirestoreDocumentId } from '../runtime/server/utils/ids/path.ts'

function load(path, exports, dependencies) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${exports}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}

const readers = load(
  '../runtime/ecosystem/server/identity/read.ts',
  '({ canonicalEcosystem, readEcosystem })',
  { createError, ECOSYSTEM_STATUSES, requireFirestoreDocumentId }
)
const at = { seconds: 1, nanoseconds: 0 }
const stamp = { at, by: 'operator' }
const root = {
  name: 'Independent',
  description: 'Shared home for future Apps',
  status: 'active',
  image_url: '',
  created: stamp,
  updated: stamp,
}

function fixture() {
  const records = new Map()
  const target = {
    collectionPath: 'ecosystems',
    database: { kind: 'identity' },
  }
  let conflicts = 0
  let authorizations = 0
  const run = load(
    '../runtime/ecosystem/server/identity/provision.ts',
    'provisionEcosystem',
    {
      createError,
      requireFirestoreDocumentId,
      canonicalEcosystem: readers.canonicalEcosystem,
      FieldValue: { serverTimestamp: () => at },
      ECOSYSTEM_MUTATION_TARGETS: { ecosystems: target },
      runGuardedServerTransaction: async (placement, work) => {
        assert.deepEqual(placement, target.database)
        // Model an optimistic transaction retry when another creator wins.
        for (;;) {
          let observed
          let creation
          const result = await work({
            read: async (owner, id) => {
              assert.equal(owner, target)
              const path = `ecosystems/${id}`
              const data = records.get(path)
              observed = { path, data }
              return { exists: records.has(path), data }
            },
            create: (owner, id, data) => {
              assert.equal(owner, target)
              assert.equal(observed?.path, `ecosystems/${id}`)
              creation = data
            },
          })
          if (records.get(observed.path) !== observed.data) {
            conflicts++
            continue
          }
          if (creation) records.set(observed.path, creation)
          return result
        }
      },
    }
  )
  const input = {
    uid: 'operator',
    ecosystemId: 'independent',
    name: root.name,
    description: root.description,
    checkPrerequisites: async () => {
      authorizations++
    },
  }
  const database = {
    collection: (collection) => ({
      doc: (id) => ({
        get: async () => ({
          id,
          exists: records.has(`${collection}/${id}`),
          data: () => records.get(`${collection}/${id}`),
        }),
      }),
    }),
  }
  return {
    records,
    run: (changes = {}) => run({ ...input, ...changes }),
    get authorizations() {
      return authorizations
    },
    get conflicts() {
      return conflicts
    },
    database,
  }
}

test('trusted provisioning creates just the Ecosystem root and canonically reads and projects it', async () => {
  const control = fixture()
  assert.equal(await control.run(), true)
  assert.deepEqual(
    [...control.records.entries()],
    [['ecosystems/independent', root]]
  )
  const ecosystem = await readers.readEcosystem('independent', control.database)
  assert.deepEqual(ecosystem, { id: 'independent', ...root })
  const entry = toEcosystemDirectoryEntry(ecosystem, {
    appCount: 0,
    detailUrl: '/ecosystems/independent',
  })
  assert.equal(entry.app_count, 0)
  assert.equal(Object.hasOwn(entry, 'project_id'), false)
  assert.equal(await control.run(), false)
  assert.equal(control.authorizations, 2)
})

test('concurrent creation retries return one created result and one existing result', async () => {
  const control = fixture()
  assert.deepEqual(await Promise.all([control.run(), control.run()]), [
    true,
    false,
  ])
  assert.equal(control.conflicts, 1)
  assert.deepEqual([...control.records.values()], [root])
})

test('an unlinked or differently linked retry cannot claim or change the Ecosystem', async () => {
  const control = fixture()
  const changes = { projectId: 'owner-project' }
  assert.equal(await control.run(changes), true)
  assert.equal(await control.run(changes), false)
  await assert.rejects(control.run(), { statusCode: 409 })
  await assert.rejects(control.run({ projectId: 'another-project' }), {
    statusCode: 409,
  })
  assert.deepEqual(
    [...control.records.values()],
    [{ ...root, project_id: 'owner-project' }]
  )

  const independent = fixture()
  assert.equal(await independent.run(), true)
  await assert.rejects(independent.run(changes), { statusCode: 409 })
  await assert.rejects(independent.run({ name: 'Different root identity' }), {
    statusCode: 409,
  })
  assert.deepEqual([...independent.records.values()], [root])
})

test('malformed inputs and invalid existing identity fail without writing', async () => {
  const control = fixture()
  for (const invalid of [
    { ecosystemId: 'another/root' },
    { uid: '' },
    { projectId: '' },
    { projectId: null },
    { name: 42 },
    { name: ' '.repeat(5) },
    { name: 'x'.repeat(121) },
    { description: {} },
    { description: 'x'.repeat(2001) },
  ]) {
    await assert.rejects(control.run(invalid), { statusCode: 400 })
  }
  assert.equal(control.records.size, 0)
  for (const change of [
    { status: 'unknown' },
    { name: '' },
    { description: {} },
    { created: undefined },
    { project_id: null },
  ]) {
    const invalid = { ...root, ...change }
    control.records.set('ecosystems/independent', invalid)
    await assert.rejects(control.run(), { statusCode: 409 })
    assert.equal(control.records.get('ecosystems/independent'), invalid)
  }
})

test('caller authority is required for both a creation and a matching retry', async () => {
  const control = fixture()
  const blocked = {
    checkPrerequisites: async () => {
      throw createError({ statusCode: 403 })
    },
  }
  await assert.rejects(control.run({ checkPrerequisites: undefined }), {
    statusCode: 403,
  })
  await assert.rejects(control.run(blocked), { statusCode: 403 })
  assert.equal(control.records.size, 0)
  await control.run()
  await assert.rejects(control.run(blocked), { statusCode: 403 })
  assert.deepEqual([...control.records.values()], [root])
})
