import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
const { computed, ref, watch, watchEffect, effectScope, createSSRApp, h } = Vue
const runtime = new URL('../../runtime/kitchen/', import.meta.url)
function load(source, deps, result) {
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
    data = ref({ name: 'A' }),
    outcome = ref('ready'),
    error = ref(null)
  const rows = ref([{ id: 'pass', name: 'Pass' }])
  const source = readFileSync(
    new URL(
      'composables/workspace/stations/useKitchenWorkspaceStations.ts',
      runtime
    ),
    'utf8'
  )
  const state = scope.run(() =>
    load(
      source,
      {
        computed,
        ref,
        watch,
        watchEffect,
        useAuth: () => ({ currentUser }),
        useFireUXConfig: () => config,
        useUserSession: () => ({ appUser }),
        useKitchenWorkspace: () => ({ id, data }),
        readRuntimeFirestoreDatabaseId: () => 'test',
        KitchenStationStorage: { collection: 'stations' },
        useKitchenStationCollection: () => ({
          kitchenStations: rows,
          pending: computed(() => outcome.value === 'pending'),
          outcome,
          error,
          collectionPath: computed(() => `kitchens/${id.value}/stations`),
        }),
        useKitchenWorkspaceReadPage: () => ({}),
        $fetch: (...args) => {
          const response = deferred()
          requests.push({ args, ...response })
          return response.promise
        },
      },
      'createKitchenWorkspaceStations()'
    )
  )
  return {
    state,
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
    error,
    rows,
  }
}
test('default Pass setup cannot dispatch with obsolete Kitchen/account/access or after disposal', async () => {
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
    if (change === 'kitchen') {
      x.id.value = 'b'
      x.id.value = 'a'
    }
    if (change === 'account') x.currentUser.value = x.user('two')
    if (change === 'signout') x.currentUser.value = null
    if (change === 'app') {
      x.config.appId = 'app-b'
      x.config.appId = 'app-a'
    }
    if (change === 'membership') {
      const initial = x.appUser.value
      x.appUser.value = { app_id: 'app-a', created: { at: 'membership-b' } }
      x.appUser.value = initial
    }
    if (change === 'access') x.data.value = null
    if (change === 'dispose') x.scope.stop()
    x.tokens[0].resolve('obsolete')
    await tick()
    assert.equal(x.requests.length, 0, change)
    x.scope.stop()
  }
})
test('Pass setup errors belong only to the current watcher generation', async () => {
  const x = harness()
  x.tokens[0].resolve('token')
  await tick()
  assert.deepEqual(x.requests[0].args[1].body, { kitchenId: 'a' })
  x.id.value = 'b'
  x.requests[0].reject(new Error('old error'))
  await tick()
  assert.equal(x.state.defaultStationError.value, '')
  x.tokens[1].resolve('token')
  await tick()
  x.requests[1].reject(new Error('current error'))
  await tick()
  assert.match(x.state.defaultStationError.value, /Could not set up/)
  x.currentUser.value = null
  assert.equal(x.state.defaultStationError.value, '')
  x.scope.stop()
})
test('non-ready reads hide retained rows and preserve error/outcome', () => {
  const x = harness()
  assert.equal(x.state.stations.value.length, 1)
  for (const state of ['pending', 'error', 'empty', 'idle']) {
    x.outcome.value = state
    assert.deepEqual(x.state.stations.value, [])
    assert.equal(x.state.outcome.value, state)
  }
  x.error.value = new Error('reader failed')
  assert.equal(x.state.error.value, x.error.value)
  x.scope.stop()
})
async function render(outcome, rows = []) {
  const source = readFileSync(
    new URL('components/Workspace/Stations/Collection/Index.vue', runtime),
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
  app.component('MoleculesCopyError', {
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
