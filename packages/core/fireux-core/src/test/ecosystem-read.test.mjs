import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { ECOSYSTEM_STATUSES } from '../runtime/ecosystem/models/ecosystem.model.ts'

const source = readFileSync(
  new URL('../runtime/ecosystem/server/identity/read.ts', import.meta.url),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
  .replace(/^export /gm, '')

const readEcosystem = compileFunction(
  `${stripTypeScriptTypes(source)}; return readEcosystem`,
  ['ECOSYSTEM_STATUSES', 'requireFirestoreDocumentId', 'createError']
)(
  ECOSYSTEM_STATUSES,
  (value) => value,
  (options) => Object.assign(new Error(options.statusMessage), options)
)

test('Ecosystem read uses document identity and distinguishes missing records', async () => {
  let exists = true
  const database = {
    collection(path) {
      assert.equal(path, 'ecosystems')
      return {
        doc(id) {
          return {
            get: async () => ({
              id,
              exists,
              data: () => ({
                id: 'stale-id',
                project_id: 'misebox-project',
                status: 'active',
                name: 'Misebox',
                context: 'Internal background',
                unused: 'Outside the Ecosystem model',
              }),
            }),
          }
        },
      }
    },
  }

  assert.deepEqual(await readEcosystem('misebox', database), {
    id: 'misebox',
    project_id: 'misebox-project',
    status: 'active',
    name: 'Misebox',
  })
  exists = false
  await assert.rejects(
    readEcosystem('misebox', database),
    (error) => error.statusCode === 404
  )
})
