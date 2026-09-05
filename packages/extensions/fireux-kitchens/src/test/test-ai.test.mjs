import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'

const source = readFileSync(new URL('../runtime/kitchen/server/test/intent.ts', import.meta.url), 'utf8')
  .replace(/^import[\s\S]*?from '[^']+'\n/gm, '')
  .replace('export async function', 'async function')
function harness(data, auth = async () => {}) {
  let request
  const interpret = compileFunction(`${stripTypeScriptTypes(source)}\nreturn interpretKitchenTest`,
    ['createError', 'useFireuxAi', 'useFireUXConfig', 'requireFirebaseBearerUser', 'testCapabilityDescription'])(
    (error) => Object.assign(new Error(error.statusMessage), error),
    () => ({ generateJson: async (value) => { request = value; return { ok: true, data } } }),
    () => ({ appId: 'test-app' }), auth, { title: 'Test' })
  return { interpret, request: () => request }
}
const body = { prompt: 'Edit this Test', selectedId: 'one', records: [{ id: 'one', value: 'hello', private: 'excluded' }], availableActions: ['read', 'update'] }
test('intent sends only bounded page context and returns a draft', async () => {
  const h = harness({ action: 'update', value: ' revised ', message: 'Review the edit.' })
  assert.equal((await h.interpret({}, { ...body, kitchen: { secret: true } })).value, 'revised')
  assert.deepEqual(h.request().context.records, [{ id: 'one', value: 'hello' }])
  assert.equal(JSON.stringify(h.request()).includes('secret'), false)
  assert.equal(JSON.stringify(h.request()).includes('excluded'), false)
})
test('unavailable actions and missing selection cannot open mutation dialogs', async () => {
  const h = harness({ action: 'delete', value: '', message: 'Review deletion.' })
  assert.equal((await h.interpret({}, body)).action, 'none')
  assert.equal((await h.interpret({}, { ...body, selectedId: '', availableActions: ['delete'] })).action, 'none')
})
test('invalid input and invalid model output fail closed', async () => {
  const h = harness({ action: 'create', value: 'x'.repeat(121), message: '' })
  await assert.rejects(h.interpret({}, { ...body, prompt: 'x'.repeat(2001) }), { statusCode: 400 })
  assert.equal(h.request(), undefined)
  await assert.rejects(h.interpret({}, body), { statusCode: 502 })
})
test('authentication failure prevents provider execution', async () => {
  const h = harness({}, async () => { throw new Error('Sign in') })
  await assert.rejects(h.interpret({}, body), /Sign in/)
  assert.equal(h.request(), undefined)
})
