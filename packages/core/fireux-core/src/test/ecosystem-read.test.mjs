import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { ECOSYSTEM_STATUSES } from '../runtime/ecosystem/models/ecosystem.model.ts'

const stamp = { at: { seconds: 1, nanoseconds: 0 }, by: 'actor' }

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
                created: stamp,
                updated: stamp,
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
    created: stamp,
    updated: stamp,
  })
  exists = false
  await assert.rejects(
    readEcosystem('misebox', database),
    (error) => error.statusCode === 404
  )
})

test('Ecosystem reads require both canonical stamps and report invalid records as failures', async () => {
  let data
  const database = {
    collection: () => ({
      doc: (id) => ({
        get: async () => ({ id, exists: true, data: () => data }),
      }),
    }),
  }
  const root = {
    project_id: 'project',
    status: 'active',
    name: 'Ecosystem',
    created: stamp,
    updated: stamp,
  }
  for (const change of [
    { created: undefined },
    { updated: undefined },
    { created: {} },
    { updated: { at: { seconds: 'bad', nanoseconds: 0 } } },
    { updated: { ...stamp, app_id: 'not-an-update-field' } },
  ]) {
    data = { ...root, ...change }
    await assert.rejects(
      readEcosystem('one', database),
      (error) => error.statusCode === 409
    )
  }
  data = {
    ...root,
    created: {
      at: { ...stamp.at, internal: true },
      by: 'actor',
      app_id: 'creator-app',
    },
  }
  assert.deepEqual((await readEcosystem('one', database)).created, {
    ...stamp,
    app_id: 'creator-app',
  })
  data = {
    ...root,
    id: 'stored-id',
    context: 'Private background',
    created: { at: stamp.at },
    updated: { at: stamp.at },
  }
  assert.deepEqual(await readEcosystem('one', database), {
    ...root,
    id: 'one',
    created: { at: stamp.at },
    updated: { at: stamp.at },
  })
})
