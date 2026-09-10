import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'

function harness(id = 'runtime') {
  const calls = []
  const source = readFileSync(new URL('../runtime/app/composables/useAppSettings.ts', import.meta.url), 'utf8')
    .replace(/^import .*\n/gm, '').replace('export function', 'function')
  const make = compileFunction(`${stripTypeScriptTypes(source)}; return useAppSettings`,
    ['useRequireUser', 'useFireUXConfig', 'fetch'])(
    async () => ({ getIdToken: async () => 'test-token' }),
    () => ({ appId: 'runtime' }),
    async (...args) => { calls.push(args); return { ok: true } },
  )
  return { settings: make({ value: { id } }), calls }
}

test('App settings send authenticated raw input to the single server validator', async () => {
  const { settings, calls } = harness()
  await settings.updateDescription('  Saved description  ')
  assert.equal(calls[0][0], '/api/internal/app/settings')
  assert.equal(calls[0][1].headers.authorization, 'Bearer test-token')
  assert.deepEqual(JSON.parse(calls[0][1].body), { description: '  Saved description  ' })
})

test('Managing another App cannot accidentally edit the runtime App', async () => {
  const { settings, calls } = harness('other')
  await assert.rejects(settings.updateAppName('Wrong target'), /current runtime App/)
  assert.equal(calls.length, 0)
})
