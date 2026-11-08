import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestore-document-id.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/project/server/directory/read.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const parserSource = readFileSync(
  new URL('../runtime/project/utils/readProject.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[^\n]*\n/gm, '')
  .replace(/^export /gm, '')
const readProjectPublicSummary = compileFunction(
  `${stripTypeScriptTypes(parserSource)};return readProjectPublicSummary`,
  ['isFirestoreDocumentId']
)(isFirestoreDocumentId)
const projectRows = [
  {
    id: 'z',
    identity: {
      name: 'Zulu',
      status: 'active',
      description: '',
      image_url: '',
    },
  },
  {
    id: 'a',
    identity: {
      name: 'Alpha',
      status: 'active',
      description: '',
      image_url: '',
    },
  },
  {
    id: 'hidden',
    identity: {
      name: 'Hidden',
      status: 'inactive',
      description: '',
      image_url: '',
    },
    guest_owner_uid: 'hidden',
  },
]
function directoryHarness(rows = projectRows) {
  const reads = []
  const filters = []
  const parsedIds = []
  const snapshot = (rows) => async () => ({
    docs: rows.map((row) => ({
      id: row.id,
      data: () => {
        parsedIds.push(row.id)
        return row
      },
    })),
  })
  const read = compileFunction(
    `${stripTypeScriptTypes(source)};return readProjects`,
    ['getRuntimeFirestore', 'readProjectPublicSummary']
  )((id) => {
    reads.push(id)
    return {
      collection: (name) => {
        assert.equal(name, 'projects')
        return {
          get: snapshot(rows),
          where: (field, operator, value) => {
            filters.push([field, operator, value])
            assert.deepEqual(
              [field, operator, value],
              ['identity.status', '==', 'active']
            )
            return {
              get: snapshot(
                rows.filter((row) => row.identity?.status === value)
              ),
            }
          },
        }
      },
    }
  }, readProjectPublicSummary)
  return { read, reads, filters, parsedIds }
}

test('Project directory queries active roots in its named database and sorts canonical public profiles', async () => {
  const harness = directoryHarness()
  const projects = await harness.read()
  assert.deepEqual(
    projects.map((row) => row.id),
    ['a', 'z']
  )
  assert.deepEqual(harness.reads, ['fireux'])
  assert.deepEqual(harness.filters, [['identity.status', '==', 'active']])
  assert.deepEqual(harness.parsedIds, ['z', 'a'])
  for (const project of projects)
    assert.deepEqual(Object.keys(project).sort(), ['id', 'identity'])
})

test('malformed inactive Projects cannot break the public directory', async () => {
  const harness = directoryHarness([
    ...projectRows,
    { id: 'malformed-draft', identity: { status: 'inactive', name: '' } },
  ])
  assert.deepEqual(
    (await harness.read()).map((row) => row.id),
    ['a', 'z']
  )
  assert.deepEqual(harness.parsedIds, ['z', 'a'])
})

test('malformed active Projects still fail canonical public validation', async () => {
  const harness = directoryHarness([
    ...projectRows,
    { id: 'malformed-active', identity: { status: 'active', name: '' } },
  ])
  await assert.rejects(harness.read(), {
    message: 'Invalid canonical Project: projects/malformed-active',
  })
  assert.deepEqual(harness.parsedIds, ['z', 'a', 'malformed-active'])
})

const detailSource = readFileSync(
  new URL('../runtime/project/server/detail/read.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
function detailHarness({ exists = true, valid = true } = {}) {
  const reads = []
  const read = compileFunction(
    `${stripTypeScriptTypes(detailSource)};return readProjectDetail`,
    ['getRuntimeFirestore', 'readProjectPublicSummary', 'createError']
  )(
    (database) => {
      assert.equal(database, 'fireux')
      return {
        collection: (name) => {
          assert.equal(name, 'projects')
          return {
            doc: (id) => {
              reads.push(id)
              return {
                get: async () => ({
                  id,
                  exists,
                  data: () => ({
                    identity: {
                      name: 'Draft',
                      status: 'inactive',
                      description: '',
                      image_url: '',
                    },
                    guest_owner_uid: 'private-owner',
                    created: { by: 'private-owner' },
                  }),
                }),
              }
            },
          }
        },
      }
    },
    (value, id) => (valid ? readProjectPublicSummary(value, id) : null),
    (value) => Object.assign(Error(value.statusMessage), value)
  )
  return { read, reads }
}
test('Project detail shares the named database without silently changing its existing publication policy', async () => {
  const h = detailHarness()
  const item = await h.read(' draft ')
  assert.equal(item.id, 'draft')
  assert.equal(item.identity.status, 'inactive')
  assert.deepEqual(Object.keys(item).sort(), ['id', 'identity'])
  assert.deepEqual(h.reads, ['draft'])
})
test('Project detail distinguishes missing documents, invalid stored data and invalid addresses', async () => {
  await assert.rejects(detailHarness({ exists: false }).read('missing'), {
    statusCode: 404,
  })
  await assert.rejects(detailHarness({ valid: false }).read('broken'), {
    statusCode: 500,
  })
  for (const id of ['', 'not/a/project']) {
    const h = detailHarness()
    await assert.rejects(h.read(id), { statusCode: 404 })
    assert.equal(h.reads.length, 0)
  }
})
