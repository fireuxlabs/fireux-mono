import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, reactive, unref, watch, effectScope } from 'vue'
import { useCommandScope } from '../../../../packages/core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'

function load(file, result, deps) {
  let source = readFileSync(new URL(file, import.meta.url), 'utf8')
  if (file.endsWith('.vue'))
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(deps)
  )(...Object.values(deps))
}
function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
const drain = async () => {
  for (let i = 0; i < 4; i++) await Promise.resolve()
}
function fixture() {
  const scope = effectScope(),
    credentials = deferred(),
    token = deferred(),
    calls = [],
    flights = []
  const user = { uid: 'actor', getIdToken: () => token.promise }
  const currentUser = ref(user),
    config = reactive({ appId: 'app-a' }),
    route = reactive({ fullPath: '/create' })
  const session = {
    appUser: ref({ created: { at: 1 } }),
    pending: ref(false),
    error: ref(null),
  }
  const deps = {
    computed,
    ref,
    unref,
    watch,
    useCommandScope,
    useAuth: () => ({ currentUser }),
    useAppSession: () => session,
    useFireUXConfig: () => config,
    useRoute: () => route,
    useRequireUser: () => credentials.promise,
    refreshNuxtData: async () => {
      session.pending.value = true
      await Promise.resolve()
      session.pending.value = false
    },
    $fetch: async (url, options) => {
      const flight = deferred()
      calls.push({ url, options })
      flights.push(flight)
      const result = await flight.promise
      await options.onResponse({ options, response: { ok: true } })
      return result
    },
  }
  const create = (sources = []) =>
    scope.run(() =>
      load(
        '../app/composables/fireux/firestore/blank/useBlank.ts',
        'useBlankCreate',
        deps
      )(sources)
    )
  return {
    scope,
    create,
    credentials,
    token,
    calls,
    flights,
    currentUser,
    config,
    route,
    session,
    user,
  }
}

for (const stage of ['credentials', 'token']) {
  for (const change of ['account', 'app', 'membership', 'route', 'dispose']) {
    test(`Blank blocks changed ${change} intent before dispatch while awaiting ${stage}`, async () => {
      const h = fixture(),
        api = h.create()
      const pending = api.createBlank({ name: 'Original' })
      const rejected = assert.rejects(
        pending,
        /context changed|account changed/
      )
      if (stage === 'token') {
        h.credentials.resolve(h.user)
        await drain()
      }
      if (change === 'account') {
        h.currentUser.value = { uid: 'other' }
        h.currentUser.value = h.user
      } else if (change === 'app') {
        h.config.appId = 'other'
        h.config.appId = 'app-a'
      } else if (change === 'membership') {
        const member = h.session.appUser.value
        h.session.appUser.value = null
        h.session.appUser.value = member
      } else if (change === 'route') {
        h.route.fullPath = '/other'
        h.route.fullPath = '/create'
      } else h.scope.stop()
      h.credentials.resolve(h.user)
      h.token.resolve('token')
      await rejected
      assert.deepEqual(h.calls, [])
      h.scope.stop()
    })
  }
}

test('Blank captures its draft before credentials and retains the endpoint, default and committed result', async () => {
  const h = fixture(),
    api = h.create(),
    draft = { name: ' Original ' }
  const pending = api.createBlank(draft)
  draft.name = 'Later'
  h.credentials.resolve(h.user)
  h.token.resolve('token')
  await drain()
  assert.equal(h.calls[0].url, '/api/workspace/blank/onboarding')
  assert.equal(h.calls[0].options.method, 'POST')
  assert.deepEqual(h.calls[0].options.body, { name: 'Original' })
  assert.deepEqual(h.calls[0].options.headers, {
    Authorization: 'Bearer token',
  })
  h.config.appId = 'other'
  const result = { ok: true, id: 'created', createdRoot: true }
  h.flights[0].resolve(result)
  assert.equal(await pending, result)
  const fallback = api.createBlank({ name: ' ' })
  await drain()
  assert.deepEqual(h.calls[1].options.body, { name: 'Blank target' })
  h.flights[1].resolve(result)
  await fallback
  h.scope.stop()
})

test('Blank rejects mismatched credentials and invalidated caller draft intent', async () => {
  for (const mismatch of ['credentials', 'draft']) {
    const h = fixture(),
      draft = ref('Original'),
      api = h.create([draft])
    const pending = api.createBlank({ name: draft.value })
    const rejected = assert.rejects(pending, /account changed|context changed/)
    if (mismatch === 'draft') draft.value = 'Changed'
    h.credentials.resolve(
      mismatch === 'credentials' ? { ...h.user, uid: 'other' } : h.user
    )
    h.token.resolve('token')
    await rejected
    assert.deepEqual(h.calls, [])
    h.scope.stop()
  }
})

for (const obsolete of ['success', 'error']) {
  test(`Blank form ignores old ${obsolete} and preserves a newer pending attempt`, async () => {
    const h = fixture(),
      effects = []
    const state = h.scope.run(() =>
      load(
        '../app/components/Blank/Create/System.vue',
        '({handleCreate, name, creating, error})',
        {
          computed,
          ref,
          watch,
          useBlankCreate: h.create,
          useBlankWorkspace: () => ({
            select: (id) => effects.push(['select', id]),
          }),
          navigateTo: async (path) => effects.push(['navigate', path]),
        }
      )
    )
    h.credentials.resolve(h.user)
    h.token.resolve('token')
    const old = state.handleCreate()
    await drain()
    h.config.appId = 'new-app'
    assert.equal(state.creating.value, false)
    state.name.value = 'New'
    const current = state.handleCreate()
    await drain()
    assert.equal(state.creating.value, true)
    if (obsolete === 'success') h.flights[0].resolve({ id: 'old' })
    else h.flights[0].reject(Error('Old failure'))
    await old
    assert.equal(state.creating.value, true)
    assert.equal(state.error.value, '')
    assert.deepEqual(effects, [])
    h.flights[1].resolve({ id: 'new' })
    await current
    assert.deepEqual(effects, [
      ['select', 'new'],
      ['navigate', '/'],
    ])
    assert.equal(state.creating.value, false)
    h.scope.stop()
  })
}
