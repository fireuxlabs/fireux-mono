import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const runtime = new URL('../../runtime/', import.meta.url)
function load(path, expression, deps) {
  const source = readFileSync(new URL(path, runtime), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${expression}`,
    Object.keys(deps)
  )(...Object.values(deps))
}

test('Kitchen-only updates use record authority inside their transaction and reject revoked access', async () => {
  const tx = { update: (...args) => writes.push(args) },
    writes = [],
    actor = { uid: 'alice' },
    checks = []
  let denied = false
  const update = load('kitchen/server/identity/update.ts', 'updateKitchen', {
    useRuntimeConfig: () => ({ public: {} }),
    createError: (v) => Object.assign(new Error(v.statusMessage), v),
    requireFirestoreDocumentId: (v) => v,
    parseKitchenUpdate: (v) => v,
    readKitchenMutationActor: async () => actor,
    runGuardedServerTransaction: async (_, run) => run(tx),
    requireKitchenRecordMutationAuthority: async (actual, a, id) => {
      checks.push([actual, a, id])
      if (denied) throw new Error('revoked')
      return { ownerAppId: 'app' }
    },
    serverAuditStamp: (value) => value,
    KITCHEN_MUTATION_TARGETS: { kitchens: 'kitchens' },
  })
  assert.deepEqual(
    await update(
      {},
      { kitchen_id: 'a', patch: { 'identity.visibility': true } }
    ),
    { ok: true, kitchen_id: 'a' }
  )
  assert.equal(checks[0][0], tx)
  assert.equal(checks[0][1], actor)
  assert.deepEqual(writes, [
    [
      'kitchens',
      'a',
      {
        'identity.visibility': true,
        updated: { by: 'alice', appId: 'app' },
      },
    ],
  ])
  denied = true
  await assert.rejects(
    update({}, { kitchen_id: 'a', patch: { 'identity.visibility': false } }),
    /revoked/
  )
  assert.equal(writes.length, 1)
})
