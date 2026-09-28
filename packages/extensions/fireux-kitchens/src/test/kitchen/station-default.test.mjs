import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
const source = (name) => stripTypeScriptTypes(readFileSync(new URL(`../../runtime/kitchen/server/stations/${name}.ts`, import.meta.url), 'utf8').replace(/^import .*\n/gm, '').replace(/^export /gm, ''))
const { createDefaultKitchenStation, kitchenStationsTarget } = compileFunction(source('default') + '; return { createDefaultKitchenStation, kitchenStationsTarget }', ['assertFirestoreMutationSegment', 'defineFirestoreMutationTarget'])((v) => v, (v) => v)
test('Pass is create-only and preserves existing renamed records; authority runs first', async () => {
  const records = new Map(), events = []
  const tx = { read: async (_, id) => ({ exists: records.has(id), data: records.get(id) }), create: (_, id, data) => { assert.equal(records.has(id), false); records.set(id, data) } }
  let allowed = true
  const ensure = compileFunction(source('ensure-default') + '; return ensureDefaultKitchenStation', ['requireFirestoreDocumentId', 'readKitchenMutationActor', 'runGuardedServerTransaction', 'requireKitchenMutationAuthority', 'kitchenStationsTarget', 'createDefaultKitchenStation', 'serverAuditStamp'])(v => v, async () => ({ uid: 'operator' }), async (_, run) => run(tx), async () => { events.push('authority'); if (!allowed) throw Error('Denied'); return { ownerAppId: 'app' } }, kitchenStationsTarget, createDefaultKitchenStation, v => v)
  assert.deepEqual(await ensure({}, { kitchenId: 'kitchen' }), { id: 'pass', created: true })
  assert.equal(records.get('pass').name, 'Pass')
  records.get('pass').name = 'Main pass'
  assert.equal((await ensure({}, { kitchenId: 'kitchen' })).created, false)
  assert.equal(records.get('pass').name, 'Main pass')
  allowed = false
  await assert.rejects(ensure({}, { kitchenId: 'kitchen' }), /Denied/)
  assert.equal(records.size, 1)
  assert.equal(events.length, 3)
})
