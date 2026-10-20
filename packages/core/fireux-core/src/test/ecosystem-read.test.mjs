import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../runtime/ecosystem/server/read.ts', import.meta.url), 'utf8')
  .replace(/^import[^\n]*\n/gm, '')
  .replace(/^export /gm, '')

test('Ecosystem read preserves document identity over stored data and distinguishes missing records', async () => {
  let exists = true
  const read = compileFunction(`${stripTypeScriptTypes(source)}; return readEcosystem`, ['getRuntimeIdentityFirestore'])(() => ({
    collection: (path) => {
      assert.equal(path, 'ecosystems')
      return { doc: (id) => ({ get: async () => ({ exists, id, data: () => ({ id: 'stale-id', name: 'Misebox', context: 'Internal background' }) }) }) }
    },
  }))
  assert.deepEqual(await read('misebox'), { id: 'misebox', name: 'Misebox' })
  exists = false
  assert.equal(await read('misebox'), null)
})
