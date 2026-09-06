import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
const source = readFileSync(new URL('../runtime/project/server/intent.ts', import.meta.url), 'utf8').replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.dev', 'true')
function harness(intent, auth = async () => {}) {
  let request, options
  const run = compileFunction(`${stripTypeScriptTypes(source)}; return interpretProject`, ['createError', 'useFireuxAi', 'useFireUXConfig', 'requireFirebaseBearerUser', 'testCapabilityDescription'])(e => Object.assign(new Error(e.statusMessage), e), (_, opts) => { options = opts; return { generateJson: async input => { request = input; return { ok: true, data: intent } } } }, () => ({ appId: 'fireux-app' }), auth, { title: 'Test' })
  return { run, request: () => request, options: () => options }
}
const identity = { capability: 'identity', prompt: 'Rename this workspace to CleanFlow', identity: { name: 'Before', description: 'Keep', imageUrl: '', private: 'omit' }, availableActions: ['read', 'update'] }
const team = { capability: 'team', prompt: 'Rename the selected teammate to Alex', selectedId: 'm', records: [{ id: 'm', name: 'Before', role: 'member', private: 'omit' }], availableActions: ['read', 'update'] }
test('Identity preserves omitted fields and sends only bounded context through dev Codex', async () => {
  const h = harness({ action: 'update', name: 'CleanFlow', description: null, imageUrl: null, message: '' })
  const result = await h.run({}, identity)
  assert.equal(result.description, null)
  assert.deepEqual(h.request().context.current, { name: 'Before', description: 'Keep', imageUrl: '' })
  assert.equal(h.options().developmentTransport, 'codex'); assert.equal(h.request().model, 'gpt-5.4-mini')
})
test('Team bounds data, accepts explicit roles and rejects unavailable or unselected changes', async () => {
  const h = harness({ action: 'update', name: 'Alex', role: 'operator', jobTitle: null, message: '' })
  assert.equal((await h.run({}, team)).role, 'operator')
  assert.deepEqual(h.request().context.records, [{ id: 'm', name: 'Before', jobTitle: '', role: 'member' }])
  assert.equal((await h.run({}, { ...team, selectedId: '' })).action, 'none')
  assert.equal((await h.run({}, { ...team, availableActions: ['read'] })).action, 'none')
})
test('Test prepares CRUD using the existing text record description', async () => {
  const h = harness({ action: 'create', value: 'Hello', message: '' })
  assert.equal((await h.run({}, { capability: 'test', prompt: 'Create Hello', records: [], availableActions: ['create'] })).value, 'Hello')
  assert.equal(h.request().context.description.title, 'Test')
})
test('invalid model output, owner role edits and unsafe image URLs fail closed', async () => {
  await assert.rejects(harness({ action: 'update', name: '', description: null, imageUrl: null, message: '' }).run({}, identity), { statusCode: 502 })
  await assert.rejects(harness({ action: 'update', name: null, description: null, imageUrl: 'javascript:alert(1)', message: '' }).run({}, identity), { statusCode: 502 })
  await assert.rejects(harness({ action: 'update', name: '', role: 'operator', jobTitle: null, message: '' }).run({}, { ...team, records: [{ id: 'm', name: 'Owner', role: 'owner' }] }), { statusCode: 502 })
})
test('authentication and input bounds stop requests before reaching the provider', async () => {
  const denied = harness({}, async () => { throw new Error('Denied') })
  await assert.rejects(denied.run({}, identity), /Denied/); assert.equal(denied.request(), undefined)
  const h = harness({}); await assert.rejects(h.run({}, { ...team, records: Array(101).fill({}) }), { statusCode: 400 }); assert.equal(h.request(), undefined)
})

test('Team does not silently discard an operator role during creation', async () => {
  const h = harness({ action: 'create', name: 'Alex', role: 'operator', jobTitle: null, message: '' })
  const result = await h.run({}, { ...team, availableActions: ['create'] })
  assert.equal(result.action, 'none')
  assert.match(result.message, /member first/)
})

test('a legacy Test without a value does not block preparation', async () => {
  const h = harness({ action: 'create', value: 'AI preview', message: '' })
  const result = await h.run({}, { capability: 'test', prompt: 'Create AI preview', records: [{ id: 'legacy' }], availableActions: ['create'] })
  assert.equal(result.action, 'create')
  assert.deepEqual(h.request().context.records, [{ id: 'legacy', value: '' }])
})

test('Team titles preserve access and support explicit clearing', async () => {
 for (const jobTitle of ['Developer', '', null]) {
  const h = harness({ action: 'update', name: '', role: '', jobTitle, message: '' })
  const result = await h.run({}, { ...team, records: [{ id: 'm', name: 'Owner', role: 'owner', jobTitle: 'Designer' }] })
  assert.equal(result.jobTitle, jobTitle)
  assert.equal(result.role, '')
 }
 await assert.rejects(harness({ action: 'update', name: '', role: '', jobTitle: 42, message: '' }).run({}, team), { statusCode: 502 })
})
