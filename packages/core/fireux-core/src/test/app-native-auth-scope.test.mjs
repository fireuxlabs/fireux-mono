import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, unref } from 'vue'
import { resolveReadOutcome } from '../runtime/utils/read-outcome.ts'
function load(file, dependencies, name) {
  const source = readFileSync(
    new URL(`../runtime/${file}`, import.meta.url),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)};return ${name}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function fixture() {
  const auth = {
      uid: ref('owner'),
      isAuthenticated: ref(true),
      hasAuthState: ref(true),
    },
    id = ref('app')
  const source = {
    data: ref(),
    pending: ref(false),
    error: ref(),
    refresh: async () => {},
  }
  let execute,
    fetches = 0,
    response = {
      appId: 'app',
      initialized: true,
      selfJoinEnabled: true,
      app: { id: 'app', name: 'App' },
    }
  const use = load(
    'app/composables/useAppRead.ts',
    {
      computed,
      unref,
      resolveReadOutcome,
      useAuth: () => auth,
      useAsyncData: (_key, handler) => {
        execute = handler
        return source
      },
      $fetch: async (path) => {
        assert.equal(path, '/api/app/status')
        fetches++
        return response
      },
    },
    'useAppRead'
  )
  const state = use(id)
  return {
    auth,
    id,
    source,
    state,
    setResponse: (value) => (response = value),
    fetches: () => fetches,
    run: async () => {
      source.data.value = await execute(
        {},
        { signal: new AbortController().signal }
      )
    },
  }
}
test('App snapshot is inactive before registered Auth and after logout', async () => {
  const f = fixture()
  f.auth.hasAuthState.value = false
  await f.run()
  assert.equal(f.fetches(), 0)
  assert.equal(f.state.outcome.value, 'idle')
  assert.equal(f.state.exists.value, undefined)
  f.auth.hasAuthState.value = true
  await f.run()
  assert.equal(f.state.canSelfJoin.value, true)
  f.auth.isAuthenticated.value = false
  f.auth.uid.value = ''
  assert.equal(f.state.app.value, undefined)
  assert.equal(f.state.exists.value, undefined)
  assert.equal(f.state.canSelfJoin.value, false)
})
test('App existence and stored join policy survive invalid presentation', async () => {
  const f = fixture()
  f.setResponse({
    appId: 'app',
    initialized: true,
    selfJoinEnabled: true,
    app: null,
  })
  await f.run()
  assert.equal(f.state.exists.value, true)
  assert.equal(f.state.outcome.value, 'empty')
  assert.equal(f.state.canSelfJoin.value, true)
  f.setResponse({
    appId: 'app',
    initialized: false,
    selfJoinEnabled: false,
    app: null,
  })
  await f.run()
  assert.equal(f.state.exists.value, false)
  assert.equal(f.state.canSelfJoin.value, false)
})
test('App/account changes immediately hide retained metadata, policy and errors', async () => {
  const f = fixture()
  await f.run()
  f.auth.uid.value = 'other'
  assert.equal(f.state.app.value, undefined)
  assert.equal(f.state.canSelfJoin.value, false)
  await f.run()
  f.id.value = 'other-app'
  assert.equal(f.state.app.value, undefined)
  await assert.rejects(f.run(), /another App/)
  f.source.error.value = new Error('Failed')
  f.auth.isAuthenticated.value = false
  assert.equal(f.state.error.value, undefined)
})
test('App status projection excludes stored private context and keeps truthful existence', async () => {
  const readAppDocument = load('app/utils/readApp.ts', {}, 'readAppDocument')
  let raw = {
    ecosystem_id: 'misebox',
    role: 'global',
    status: 'active',
    name: 'App',
    context: 'PRIVATE',
    project_id: 'PRIVATE',
    created: { at: { seconds: 1, nanoseconds: 0 } },
    updated: { at: { seconds: 1, nanoseconds: 0 } },
  }
  const readStatus = load(
    'app/server/index/status.ts',
    {
      useFireUXConfig: () => ({ appId: 'app' }),
      isAppMediaComplete: () => false,
      readAppDocument,
      getRuntimeFirestore: () => ({
        collection: () => ({
          doc: () => ({ get: async () => ({ exists: true, data: () => raw }) }),
        }),
      }),
    },
    'readAppStatus'
  )
  assert.equal(JSON.stringify(await readStatus({})).includes('PRIVATE'), false)
  raw = { ...raw, name: null }
  const result = await readStatus({})
  assert.equal(result.initialized, true)
  assert.equal(result.app, null)
})
