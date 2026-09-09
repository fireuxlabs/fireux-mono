import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const raw = readFileSync(new URL('../runtime/kitchen/server/menus/intent.ts', import.meta.url), 'utf8')
const context = {
  kitchenId: 'kitchen-one', menus: [{ id: 'food', name: 'Food', status: 'draft', items: ['private'] }],
  selectedMenuId: 'food', derived: { allowance: { count: 1, limit: 2 }, capability: { primitives: {
    create: { available: true }, update: { available: true }, delete: { available: false },
  } } },
}
function harness(intent, { authenticated = true, dev = true } = {}) {
  let request
  let transport
  const source = raw.replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replace(/^export /gm, '').replaceAll('import.meta.dev', String(dev))
  const interpret = compileFunction(`${stripTypeScriptTypes(source)}; return interpretKitchenMenus`, ['createError', 'firebaseBearerUser', 'useFireUXConfig', 'useFireuxAi', 'kitchenLandingDestinations'])(
    value => Object.assign(new Error(value.statusMessage), value),
    async () => authenticated ? { uid: 'user' } : null,
    () => ({ appId: 'test-app' }),
    (_event, options) => { transport = options; return { generateJson: async value => { request = value; return { ok: true, data: intent } } } },
    { menus: '/workspace/kitchen/menus' },
  )
  return { interpret, request: () => request, transport: () => transport }
}
const answer = { action: 'create', target: '', message: 'Review the form.' }
test('Menus projects only its bounded records and uses local Codex', async () => {
  const h = harness(answer)
  await h.interpret({}, { prompt: 'Open Create Menu', context })
  assert.deepEqual(h.request().context.records, [{ id: 'food', name: 'Food', status: 'draft' }])
  assert.deepEqual(h.transport(), { developmentTransport: 'codex' })
})
test('Menus local and deployed envelopes match apart from the local model', async () => {
  const local = harness(answer), deployed = harness(answer, { dev: false })
  await local.interpret({}, { prompt: 'Help', context })
  await deployed.interpret({}, { prompt: 'Help', context })
  const { model, ...envelope } = local.request()
  assert.equal(model, 'gpt-5.4-mini')
  assert.deepEqual(envelope, deployed.request())
})
test('guest receives no supplied kitchen records or actions', async () => {
  const h = harness({ action: 'none', target: '', message: 'Sign in.' }, { authenticated: false })
  await h.interpret({}, { prompt: 'Help', context })
  assert.deepEqual(h.request().context.records, [])
  assert.deepEqual(h.request().context.availableActions, ['none'])
  assert.equal(h.request().context.kitchenId, '')
})
test('rejects invented ids, wrong selected targets and protected delete', async () => {
  for (const intent of [
    { ...answer, action: 'read', target: 'other' },
    { ...answer, action: 'update', target: 'other' },
    { ...answer, action: 'delete', target: 'food' },
  ]) await assert.rejects(harness(intent).interpret({}, { prompt: 'Do it', context }), /could not prepare/)
})
