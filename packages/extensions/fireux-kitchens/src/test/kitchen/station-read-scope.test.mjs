import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import * as Vue from 'vue'
import { renderToString } from 'vue/server-renderer'
const { computed, ref, watch, effectScope, createSSRApp, h } = Vue
const runtime = new URL('../../runtime/kitchen/', import.meta.url)
function load(source, deps, result) {
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
function harness() {
  const scope = effectScope()
  const currentUser = ref({ uid: 'one' })
  const id = ref('a'),
    data = ref({ id: 'a', name: 'A' })
  const workspaceOutcome = ref('ready'),
    outcome = ref('ready')
  const accessOutcome = ref('ready')
  const rows = ref([{ id: 'hot', name: 'Hot' }])
  let readTarget
  const provided = new Map()
  const route = Vue.reactive({ fullPath: '/workspace/kitchen/prep/stations' })
  const useWorkspaceRecord = load(
    readFileSync(
      new URL(
        '../../../../../core/fireux-core/src/runtime/workspace/composables/useWorkspaceRecord.ts',
        runtime
      ),
      'utf8'
    ),
    { computed },
    'useWorkspaceRecord'
  )
  const workspace = useWorkspaceRecord(
    id,
    { ids: computed(() => [id.value]), outcome: accessOutcome },
    () => ({ outcome: workspaceOutcome }),
    () => data
  )
  const deps = {
    useRoute: () => route,
    computed,
    ref,
    watch,
    provide: (key, value) => provided.set(key, value),
    inject: (key) => provided.get(key),
    useAuth: () => ({ currentUser }),
    useKitchenWorkspace: () => workspace,
    KitchenStationStorage: { collection: 'stations' },
    normalizeKitchenStation: (station) => station,
    useKitchenChildCollection: (collection, target) => {
      assert.equal(collection, 'stations')
      assert.equal(readTarget, undefined, 'The page owns one Station read')
      readTarget = target
      return { items: rows, outcome }
    },
  }
  const source = (path) => readFileSync(new URL(path, runtime), 'utf8')
  Object.assign(
    deps,
    load(
      source('composables/workspace/prep/stations/read.ts'),
      deps,
      '({ provideKitchenWorkspacePrepStationsRead, useKitchenWorkspacePrepStationsRead })'
    )
  )
  scope.run(() =>
    load(
      source('components/Workspace/Prep/Stations/Index.vue'),
      deps,
      '({ kitchenId, stations, outcome })'
    )
  )
  const state = deps.useKitchenWorkspacePrepStationsRead()
  const tools = scope.run(() =>
    load(
      source('components/Workspace/Prep/Stations/Tools.vue'),
      deps,
      'createOpen'
    )
  )
  return {
    state,
    tools,
    route,
    scope,
    id,
    data,
    currentUser,
    outcome,
    workspaceOutcome,
    accessOutcome,
    readTarget,
  }
}

test('Station reads wait for the new Kitchen before binding its collection', () => {
  const x = harness()
  x.id.value = 'b'
  assert.equal(x.readTarget.value, '')
  assert.equal(x.state.outcome.value, 'pending')
  assert.deepEqual(x.state.stations.value, [])
  x.data.value = { id: 'b', name: 'B' }
  assert.equal(x.readTarget.value, 'b')
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
    new URL('components/Workspace/Prep/Stations/Collection/Index.vue', runtime),
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
      defineProps: () => ({ stations: rows, outcome }),
    },
    '{ sortedStations, stationDisplayName, outcome: props.outcome }'
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
    assert.doesNotMatch(html, /No stations found|\d+ stations?/)
  }
  assert.match(await render('empty'), /No stations found/)
  const ready = await render('ready', [
    { id: 'hot', name: 'Hot' },
    { id: 'cold', name: 'Cold' },
  ])
  assert.ok(ready.indexOf('Cold') < ready.indexOf('Hot'))
  assert.match(ready, /2 stations/)
})

test('Station creation disclosure belongs to the current account, Kitchen and route', () => {
  for (const change of ['account', 'kitchen', 'route', 'access']) {
    const x = harness()
    x.tools.value = true
    if (change === 'account') x.currentUser.value = { uid: 'other' }
    if (change === 'kitchen') x.id.value = 'other'
    if (change === 'route') x.route.fullPath = '/workspace/kitchen/overview'
    if (change === 'access') x.accessOutcome.value = 'empty'
    assert.equal(x.tools.value, false)
    x.scope.stop()
  }
})
