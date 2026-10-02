import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, existsSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, ref, watch } from 'vue'

const runtime = new URL('../../runtime/', import.meta.url)
function load(path, dependencies, result, sfc = false) {
  let source = readFileSync(new URL(path, runtime), 'utf8')
  if (sfc)
    source = source.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
  source = source
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(
    `${stripTypeScriptTypes(source)}; return ${result}`,
    Object.keys(dependencies)
  )(...Object.values(dependencies))
}
function directory() {
  const scope = effectScope()
  const selectedId = ref('a')
  const currentUser = ref({ uid: 'one' })
  const states = new Map()
  const navigations = []
  const route = { path: '/workspace/kitchen/stock/waste' }
  const tools = {
    waste: [{ id: 'kitchen.waste.record-event', status: 'available' }],
    stations: [{ id: 'kitchen.stations.create-station', status: 'available' }],
    team: [{ id: 'kitchen.team.create-member', status: 'agent-ready' }],
  }
  const dependencies = {
    computed,
    watch,
    useAuth: () => ({ currentUser }),
    useWorkspace: () => ({ selectedId }),
    useRoute: () => route,
    useState: (key, init) => {
      if (!states.has(key)) states.set(key, ref(init()))
      return states.get(key)
    },
    useKitchenMenuCollection: () => ({ menus: ref([]) }),
    kitchenCapabilityTools: tools,
    navigateTo: async (path) => {
      navigations.push(path)
      route.path = path
    },
  }
  const create = load(
    'kitchen/composables/workspace/useKitchenCapabilityTools.ts',
    dependencies,
    'useKitchenCapabilityTools'
  )
  const state = scope.run(() => create('waste'))
  return { state, scope, selectedId, currentUser, navigations, route, create }
}
test('Waste modal stays on its host and navigates to an existing page from elsewhere', async () => {
  const h = directory()
  await h.state.performAction('kitchen.waste.record-event')
  assert.equal(h.state.activeToolId.value, 'kitchen.waste.record-event')
  assert.deepEqual(h.navigations, [])
  h.route.path = '/workspace/kitchen/stations'
  await h.state.performAction('kitchen.waste.record-event')
  assert.deepEqual(h.navigations, ['/workspace/kitchen/stock/waste'])
  assert.ok(
    existsSync(
      new URL('pages/workspace/kitchen/stock/waste/index.vue', runtime)
    )
  )
  assert.equal(await h.state.performAction('kitchen.team.create-member'), false)
  h.scope.stop()
})
test('Kitchen/account changes clear active tools, including away-and-back and remount', async () => {
  for (const target of ['kitchen', 'account']) {
    const h = directory()
    await h.state.performAction('kitchen.waste.record-event')
    if (target === 'kitchen') {
      h.selectedId.value = 'b'
      h.selectedId.value = 'a'
    } else {
      h.currentUser.value = null
      h.currentUser.value = { uid: 'one' }
    }
    assert.equal(h.state.activeToolId.value, '')
    await h.state.performAction('kitchen.waste.record-event')
    h.scope.stop()
    h.selectedId.value = 'b'
    const remount = effectScope()
    const next = remount.run(() => h.create('waste'))
    assert.equal(next.activeToolId.value, '')
    remount.stop()
  }
})
test('Station draft clears and a previous save cannot replace the new context state', async () => {
  for (const change of ['kitchen', 'account']) {
    const scope = effectScope()
    const kitchenId = ref('a'),
      currentUser = ref({ uid: 'one' })
    const saves = []
    let unmount
    const state = scope.run(() =>
      load(
        'kitchen/components/Workspace/Stations/Write.vue',
        {
          computed,
          ref,
          watch,
          onBeforeUnmount: (fn) => {
            unmount = fn
          },
          useAuth: () => ({ currentUser }),
          useKitchenWorkspaceStations: () => ({
            kitchenId,
            rootCollection: ref('kitchens'),
            canWrite: ref(true),
            stations: ref([]),
          }),
          useKitchenStationCreate: () => ({
            createKitchenStation: (input) =>
              new Promise((resolve) => saves.push({ input, resolve })),
          }),
        },
        '{ name, message, saving, addStation }',
        true
      )
    )
    state.name.value = 'Grill'
    const old = state.addStation()
    if (change === 'kitchen') kitchenId.value = 'b'
    else currentUser.value = { uid: 'two' }
    assert.equal(state.name.value, '')
    assert.equal(state.message.value, '')
    state.name.value = 'Cold kitchen'
    const next = state.addStation()
    saves[0].resolve('grill')
    await old
    assert.equal(state.name.value, 'Cold kitchen')
    assert.equal(state.saving.value, true)
    saves[1].resolve('cold-kitchen')
    await next
    assert.equal(state.message.value, 'Added cold-kitchen.')
    unmount()
    scope.stop()
  }
})
