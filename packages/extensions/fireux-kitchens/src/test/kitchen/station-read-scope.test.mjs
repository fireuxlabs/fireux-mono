import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
import { commandScopeDeps } from '../command-scope-fixture.mjs'
const { computed, ref, watch, watchEffect, effectScope, createSSRApp, h } = Vue
const runtime = new URL('../../runtime/kitchen/', import.meta.url)
function load(source, deps, result) {
  deps = commandScopeDeps(deps)
  if (source.includes('<script setup'))
    source = source.match(/<script setup[^>]*>([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
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
const tick = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
function harness() {
  const scope = effectScope(),
    tokens = [],
    requests = []
  const user = (uid) => ({
    uid,
    getIdToken: () => {
      const token = deferred()
      tokens.push(token)
      return token.promise
    },
  })
  const currentUser = ref(user('one'))
  const config = Vue.reactive({ appId: 'app-a' })
  const appUser = ref({ app_id: 'app-a', created: { at: 'membership-a' } })
  const id = ref('a'),
    data = ref({ id: 'a', name: 'A' })
  const workspaceOutcome = ref('ready'),
    outcome = ref('ready'),
    error = ref(null)
  const rows = ref([{ id: 'pass', name: 'Pass' }])
  let readTarget
  const route = Vue.reactive({ fullPath: '/workspace/kitchen/stations' })
  const deps = {
    useRoute: () => route,
    computed,
    ref,
    watch,
    watchEffect,
    useAuth: () => ({ currentUser }),
    useFireUXConfig: () => config,
    useUserSession: () => ({ appUser }),
    useKitchenWorkspace: () => ({ id, data, outcome: workspaceOutcome }),
    readRuntimeFirestoreDatabaseId: () => 'test',
    KitchenStationStorage: { collection: 'stations' },
    useKitchenStationCollection: (target) => {
      readTarget = target
      return {
        kitchenStations: rows,
        pending: computed(() => outcome.value === 'pending'),
        outcome,
        error,
        collectionPath: computed(() =>
          target.value ? 'kitchens/' + target.value + '/stations' : ''
        ),
      }
    },
    useKitchenWorkspaceReadPage: () => ({}),
    $fetch: (...args) => {
      const response = deferred()
      requests.push({ args, ...response })
      return response.promise
    },
  }
  const source = (path) => readFileSync(new URL(path, runtime), 'utf8')
  const state = scope.run(() =>
    load(
      source('composables/workspace/stations/useKitchenWorkspaceStations.ts'),
      deps,
      'createKitchenWorkspaceStations()'
    )
  )
  deps.useKitchenWorkspaceStations = () => state
  deps.useKitchenStationCreate = load(
    source('composables/stations/useKitchenStationCreate.ts'),
    deps,
    'useKitchenStationCreate'
  )
  const surface = scope.run(() =>
    load(
      source('components/PrepAndProduction/Stations/Index.vue'),
      deps,
      '({addPass,creating,defaultStationError})'
    )
  )
  return {
    state,
    route,
    surface,
    scope,
    id,
    data,
    currentUser,
    config,
    appUser,
    user,
    tokens,
    requests,
    outcome,
    workspaceOutcome,
    error,
    rows,
    readTarget,
  }
}

test('the Station reader and surface require an explicit action to add Pass', async () => {
  const x = harness()
  x.outcome.value = 'empty'
  await tick()
  assert.equal(x.tokens.length, 0)
  assert.equal(x.requests.length, 0)
  const pending = x.surface.addPass()
  assert.equal(x.tokens.length, 1)
  x.tokens[0].resolve('token')
  await tick()
  assert.deepEqual(x.requests[0].args[1].body, { kitchenId: 'a' })
  x.requests[0].resolve({ id: 'pass', created: true })
  await pending
  assert.equal(x.surface.creating.value, false)
  x.scope.stop()
})

test('explicit Pass setup blocks obsolete Kitchen/account/access and disposal before dispatch', async () => {
  for (const change of [
    'kitchen',
    'account',
    'signout',
    'app',
    'membership',
    'access',
    'dispose',
  ]) {
    const x = harness()
    const pending = x.surface.addPass()
    if (change === 'kitchen') {
      x.id.value = 'b'
      x.id.value = 'a'
    }
    if (change === 'account' || change === 'signout') {
      const original = x.currentUser.value
      x.currentUser.value = change === 'account' ? x.user('two') : null
      x.currentUser.value = original
    }
    if (change === 'app') {
      x.config.appId = 'app-b'
      x.config.appId = 'app-a'
    }
    if (change === 'membership') {
      const original = x.appUser.value
      x.appUser.value = { created: { at: 'membership-b' } }
      x.appUser.value = original
    }
    if (change === 'access') {
      const original = x.data.value
      x.data.value = null
      x.data.value = original
    }
    if (change === 'dispose') x.scope.stop()
    x.tokens[0].resolve('obsolete')
    await tick()
    assert.equal(x.requests.length, 0, change)
    await pending
    assert.equal(x.surface.defaultStationError.value, '')
    x.scope.stop()
  }
})

test('Pass setup errors and busy completion belong only to the current action', async () => {
  const x = harness()
  const oldRequest = x.surface.addPass()
  x.tokens[0].resolve('token')
  await tick()
  x.id.value = 'b'
  x.data.value = { id: 'b', name: 'B' }
  const newRequest = x.surface.addPass()
  x.requests[0].reject(new Error('old error'))
  await oldRequest
  assert.equal(x.surface.defaultStationError.value, '')
  assert.equal(x.surface.creating.value, true)
  x.tokens[1].resolve('token')
  await tick()
  x.requests[1].reject(new Error('current error'))
  await newRequest
  assert.equal(x.surface.defaultStationError.value, 'current error')
  assert.equal(x.surface.creating.value, false)
  x.scope.stop()
})

test('non-ready Station or Workspace reads hide retained rows and preserve their outcome', () => {
  const x = harness()
  assert.equal(x.state.stations.value.length, 1)
  for (const state of ['pending', 'error', 'empty', 'idle']) {
    x.outcome.value = state
    assert.deepEqual(x.state.stations.value, [])
    assert.equal(x.state.outcome.value, state)
  }
  x.error.value = new Error('reader failed')
  assert.equal(x.state.error.value, x.error.value)
  x.outcome.value = 'ready'
  for (const state of ['pending', 'error', 'empty', 'idle']) {
    x.workspaceOutcome.value = state
    assert.deepEqual(x.state.stations.value, [])
    assert.equal(x.state.outcome.value, state)
    assert.equal(x.readTarget.value, '')
  }
  x.scope.stop()
})
async function render(outcome, rows = []) {
  const source = readFileSync(
    new URL(
      'components/PrepAndProduction/Stations/Collection/Index.vue',
      runtime
    ),
    'utf8'
  )
  const template = source.slice(
    source.indexOf('<template>') + 10,
    source.lastIndexOf('</template>')
  )
  const script = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  const context = load(
    script,
    {
      computed,
      useKitchenWorkspaceStations: () => ({
        stations: ref(rows),
        outcome: ref(outcome),
      }),
    },
    '{ sortedStations, stationDisplayName, outcome }'
  )
  const render = Vue.compile(template)
  const app = createSSRApp({ setup: () => context, render })
  app.component('UCard', {
    setup:
      (_, { slots }) =>
      () =>
        h('section', [slots.header?.(), slots.default?.()]),
  })
  app.component('UBadge', {
    setup:
      (_, { slots }) =>
      () =>
        h('b', { 'data-count': '' }, slots.default?.()),
  })
  app.component('UIcon', { render: () => null })
  app.component('FireCopyError', {
    props: ['message'],
    setup: (props) => () => h('button', props.message),
  })
  return renderToString(app)
}
test('Stations renders loading, failure and empty distinctly, with settled-only counts', async () => {
  for (const [state, text] of [
    ['pending', 'Loading stations'],
    ['error', 'Stations could not be loaded'],
    ['idle', 'Select a kitchen'],
  ]) {
    const html = await render(state)
    assert.match(html, new RegExp(text))
    assert.doesNotMatch(html, /No stations found|data-count/)
  }
  assert.match(await render('empty'), /No stations found/)
  const ready = await render('ready', [
    { id: 'b', name: 'Grill', sort_order: 2 },
    { id: 'a', name: 'Pass', sort_order: 0 },
  ])
  assert.ok(ready.indexOf('Pass') < ready.indexOf('Grill'))
  assert.match(ready, /data-count/)
})

test('Station creation disclosure belongs to the current account, Kitchen and route', () => {
  for (const change of ['account', 'kitchen', 'route', 'access']) {
    const x = harness()
    x.state.createOpen.value = true
    if (change === 'account') x.currentUser.value = x.user('other')
    if (change === 'kitchen') x.id.value = 'other'
    if (change === 'route') x.route.fullPath = '/workspace/kitchen/overview'
    if (change === 'access') x.workspaceOutcome.value = 'empty'
    assert.equal(x.state.createOpen.value, false)
    x.scope.stop()
  }
})
