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
    ['useRequireUser', 'useFireUXConfig', 'fetch', 'useAuth', 'useCommandScope'])(
    async () => ({ uid: 'actor', getIdToken: async () => 'test-token' }),
    () => ({ appId: 'runtime' }),
    async (...args) => { calls.push(args); return { ok: true, json: async () => ({ ok: true, appId: 'runtime' }) } },
    () => ({ currentUser: { value: { uid: 'actor' } } }),
    () => () => () => true,
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

test('App address changes update only the website field', async () => {
  const { settings, calls } = harness()
  await settings.updateWebsite('https://example.test/app')
  assert.deepEqual(JSON.parse(calls[0][1].body), {
    'social_links.website': 'https://example.test/app',
  })
})

test('App address validator accepts HTTPS, allows removal and rejects unsafe schemes', () => {
  const source = readFileSync(new URL('../runtime/app/server/settings/update.ts', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  const normalize = compileFunction(`${stripTypeScriptTypes(source)}; return normalizePatch`,
    ['createError'])(({ statusMessage }) => new Error(statusMessage))
  assert.deepEqual(normalize({ 'social_links.website': ' https://example.test ' }), {
    'social_links.website': 'https://example.test/',
  })
  assert.deepEqual(normalize({ 'social_links.website': '' }), { 'social_links.website': '' })
  assert.throws(() => normalize({ 'social_links.website': 'javascript:alert(1)' }), /App address must use HTTPS/)
  assert.throws(() => normalize({ 'social_links.website': 'not a url' }), /valid HTTPS URL/)
})
