import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire, stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import test from 'node:test'
import { currentKitchenAIHandoff } from '../runtime/kitchen/models/ai-handoff.ts'
const require = createRequire(new URL('../../package.json', import.meta.url))
const { computed, ref, watch, nextTick } = require('vue')
const raw = readFileSync(new URL('../runtime/kitchen/components/Workspace/Menus/Ai.vue', import.meta.url), 'utf8').split('<script setup lang="ts">')[1].split('</script>')[0]
const source = stripTypeScriptTypes(raw.replace(/^import[\s\S]*?from '[^']+'\n/gm, '').replaceAll('import.meta.dev', 'true'))
const record = { userId: 'user', kitchenId: 'kitchen', capability: 'menus', prompt: 'Open Create Menu', createdAt: Date.now() }
function setup(handoffValue = record) {
  const handoff = ref(handoffValue ? { ...handoffValue } : null)
  const user = ref({ uid: 'user', getIdToken: async () => 'test-token' })
  const createOpen = ref(false), readOpen = ref(false)
  const workspace = {
    kitchenId: ref('kitchen'), kitchensPending: ref(false), menus: ref([{ id: 'food', slug: 'food-menu' }]), selectedMenuId: ref('food'),
    state: ref({ menus: [{ id: 'food', name: 'Food', status: 'draft' }], selectedMenuId: 'food' }),
    derived: ref({ status: 'ready', capability: { primitives: { create: { available: true }, read: { available: true }, update: { available: true }, delete: { available: false } } } }),
    actions: { openCreate: () => { createOpen.value = true }, openRead: () => { readOpen.value = true } },
  }
  const mounts = [], stops = [], unmounts = [], requests = [], navigations = []
  let resolveRequest
  const fetch = (url, options) => { requests.push({ url, options }); return new Promise(resolve => { resolveRequest = resolve }) }
  const component = compileFunction(`${source}; return { ask, prompt, message, submitting }`, ['computed','onBeforeUnmount','onMounted','ref','watch','navigateTo','useAuth','useKitchenMenusContext','useKitchenAIHandoff','currentKitchenAIHandoff','$fetch'])(
    computed, fn => unmounts.push(fn), fn => mounts.push(fn), ref,
    (...args) => { const stop = watch(...args); stops.push(stop); return stop },
    path => navigations.push(path), () => ({ currentUser: user }), () => workspace, () => handoff, currentKitchenAIHandoff, fetch,
  )
  return { ...component, handoff, user, workspace, requests, createOpen, readOpen, navigations,
    mount: async () => { mounts.forEach(fn => fn()); await nextTick(); await nextTick() },
    resolve: async intent => { resolveRequest(intent); await nextTick(); await nextTick() },
    stop: () => { unmounts.forEach(fn => fn()); stops.forEach(fn => fn()) },
  }
}
test('handoff rejects another user, kitchen, expired and invalid timestamps', () => {
  const now = Date.now(), valid = { ...record, createdAt: now }
  assert.equal(currentKitchenAIHandoff(valid, 'user', 'kitchen', now), valid)
  for (const value of [{ ...valid, userId: 'other' }, { ...valid, kitchenId: 'other' }, { ...valid, createdAt: now - 120001 }, { ...valid, createdAt: NaN }, { ...valid, createdAt: now + 1 }]) {
    assert.equal(currentKitchenAIHandoff(value, 'user', 'kitchen', now), null)
  }
})
test('receiver consumes once and opens the existing create control without writing', async () => {
  const h = setup()
  try {
    await h.mount()
    assert.equal(h.handoff.value, null)
    assert.equal(h.requests.length, 1)
    assert.equal(h.requests[0].options.body.prompt, record.prompt)
    assert.equal(h.requests[0].options.body.context.kitchenId, 'kitchen')
    await h.resolve({ action: 'create', target: '', message: 'Prepared.' })
    assert.equal(h.createOpen.value, true)
    h.workspace.state.value = { ...h.workspace.state.value }
    await nextTick()
    assert.equal(h.requests.length, 1)
  } finally { h.stop() }
})
test('receiver drops a mismatched handoff without making a request', async () => {
  const h = setup({ ...record, kitchenId: 'other' })
  try { await h.mount(); assert.equal(h.requests.length, 0); assert.equal(h.handoff.value, null) } finally { h.stop() }
})
test('changed-and-restored context invalidates the in-flight response', async () => {
  const h = setup()
  try {
    await h.mount()
    h.workspace.kitchenId.value = 'other'
    h.workspace.kitchenId.value = 'kitchen'
    await h.resolve({ action: 'create', target: '', message: 'Prepared.' })
    assert.equal(h.createOpen.value, false)
    assert.match(h.message.value, /changed/)
  } finally { h.stop() }
})
test('account switch and unmount prevent an old response opening controls', async () => {
  for (const change of [h => { h.user.value = { uid: 'other' } }, h => h.stop()]) {
    const h = setup()
    try { await h.mount(); change(h); await h.resolve({ action: 'create', target: '', message: 'Prepared.' }); assert.equal(h.createOpen.value, false) } finally { h.stop() }
  }
})
test('update and delete use existing review routes; protected delete is unavailable', async () => {
  const h = setup()
  try {
    await h.mount()
    await h.resolve({ action: 'update', target: 'food', message: 'Prepared.' })
    assert.deepEqual(h.navigations, ['/workspace/kitchen/menus/food-menu'])
  } finally { h.stop() }
  const blocked = setup()
  try { await blocked.mount(); await blocked.resolve({ action: 'delete', target: 'food', message: 'Prepared.' }); assert.deepEqual(blocked.navigations, []) } finally { blocked.stop() }
})
