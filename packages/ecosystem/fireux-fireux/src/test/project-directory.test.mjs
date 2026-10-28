import { isFirestoreDocumentId } from '../../../../core/fireux-core/src/runtime/utils/firestore-document-id.ts'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = readFileSync(
  new URL('../runtime/project/server/index/directory.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')
const parserSource=readFileSync(new URL('../runtime/project/utils/readProject.ts',import.meta.url),'utf8').replace(/^import[^\n]*\n/gm,'').replace(/^export /gm,'')
const readProjectPublicSummary=compileFunction(`${stripTypeScriptTypes(parserSource)};return readProjectPublicSummary`,['isFirestoreDocumentId'])(isFirestoreDocumentId)
const projectRows = [
  { id:'z', identity:{name:'Zulu',status:'active',description:'',image_url:''} },
  { id:'a', identity:{name:'Alpha',status:'active',description:'',image_url:''} },
  { id:'hidden', identity:{name:'Hidden',status:'inactive',description:'',image_url:''}, guest_owner_uid:'hidden' },
]
test('Project directory uses its named database and filters/sorts only canonical active Projects', async () => {
  const reads = []
  const read = compileFunction(
    `${stripTypeScriptTypes(source)};return readProjects`,
    ['getRuntimeFirestore', 'readProjectPublicSummary']
  )(
    (id) => {
      reads.push(id)
      return {
        collection: (name) => {
          assert.equal(name, 'projects')
          return {
            get: async () => ({
              docs: projectRows.map((row) => ({ id: row.id, data: () => row })),
            }),
          }
        },
      }
    },
    readProjectPublicSummary
  )
  assert.deepEqual(
    (await read()).map((row) => row.id),
    ['a', 'z']
  )
  assert.deepEqual(reads, ['fireux'])
})

const detailSource = readFileSync(
  new URL('../runtime/project/server/index/detail.ts', import.meta.url),
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
                  data: () => ({ identity:{name:'Draft',status:'inactive',description:'',image_url:''}, guest_owner_uid:'private-owner', created:{by:'private-owner'} }),
                }),
              }
            },
          }
        },
      }
    },
    (value, id) => (valid ? readProjectPublicSummary(value,id) : null),
    (value) => Object.assign(Error(value.statusMessage), value)
  )
  return { read, reads }
}
test('Project detail shares the named database without silently changing its existing publication policy', async () => {
  const h = detailHarness()
  const item = await h.read(' draft ')
  assert.equal(item.id, 'draft')
  assert.equal(item.identity.status, 'inactive')
  assert.deepEqual(Object.keys(item).sort(),['id','identity'])
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
