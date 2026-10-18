import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { ref, computed, watch, onScopeDispose, effectScope, toValue } from 'vue'
function load(path, expression, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .replace(/^[\s\S]*<script setup[^>]*>([\s\S]*?)<\/script>[\s\S]*$/, '$1')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '').replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)}; return ${expression}`, Object.keys(deps))(...Object.values(deps))
}
const useCommandScope = load('../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts', 'useCommandScope', { watch, onScopeDispose })
const deferred = () => { let resolve; const promise = new Promise(r => { resolve = r }); return { promise, resolve } }
const base = '../runtime/kitchen/'
function harness(kind, delayed = false) {
  const scope = effectScope(), credentials = deferred(), response = deferred(), calls = []
  const currentUser = ref({ uid: 'alice', getIdToken: () => credentials.promise })
  const selectedId = ref('kitchen-a'), appId = ref('app-a'), kitchenId = ref('kitchen-a'), offeringId = ref('offering-a')
  const appUser = ref({ created: { at: 'one' }, role: 'user' }), ids = ref(['kitchen-a']), outcome = ref('ready')
  const deps = { ref, computed, watch, toValue, useCommandScope,
    useAuth: () => ({ currentUser }), useUserSession: () => ({ appUser }), useKitchenAccess: () => ({ ids, outcome }),
    useWorkspace: () => ({ selectedId }), useWorkspaceWriteGuard: () => ({ requireWritableData: () => selectedId.value }),
    $fetch: async (url, options) => { calls.push({ url, options }); return delayed ? response.promise : result(kind) },
  }
  const paths = { transition: 'composables/orders/useKitchenOrderTransition.ts', end: 'composables/orders/useKitchenOrderNumbering.ts', whatsapp: 'composables/workspace/offerings/useKitchenOfferingWhatsAppTest.ts' }
  const names = { transition: 'useKitchenOrderTransition', end: 'useKitchenOrderNumbering', whatsapp: 'useKitchenOfferingWhatsAppTest' }
  const api = scope.run(() => load(base + paths[kind], names[kind], deps)({ appId, kitchenId, offeringId }))
  const invoke = input => kind === 'transition' ? api.transitionKitchenOrder('kitchen-a', 'order-a', 'accept', input) : kind === 'end' ? api.resetNumbering() : api.sendTest()
  return { api, invoke, scope, credentials, response, calls, currentUser, selectedId, appId, kitchenId, offeringId, appUser, ids, outcome }
}
function result(kind) { return { ok: true, app_id: 'app-a', kitchen_id: 'kitchen-a',
  ...(kind === 'transition' ? { order: { id: 'order-a', status: 'accepted' } } : kind === 'end' ? { numbering: { service_id: 'next', previous_service_id: 'previous', previous_order_count: 3 } } : { kitchen_offering_id: 'offering-a', provider_message_id: 'provider-a' }) } }
for (const kind of ['transition', 'end', 'whatsapp']) {
  for (const change of ['account ABA', 'App ABA', 'Kitchen ABA', 'membership ABA', 'access ABA', 'disposal']) {
    test(`${kind} rejects credential continuation after ${change}`, async () => {
      const w = harness(kind), pending = w.invoke()
      if (change === 'account ABA') { const old = w.currentUser.value; w.currentUser.value = { ...old, uid: 'bob' }; w.currentUser.value = old }
      if (change === 'App ABA') { w.appId.value = 'app-b'; w.appId.value = 'app-a' }
      if (change === 'Kitchen ABA') { w.selectedId.value = 'kitchen-b'; w.kitchenId.value = 'kitchen-b'; w.selectedId.value = 'kitchen-a'; w.kitchenId.value = 'kitchen-a' }
      if (change === 'membership ABA') { const old = w.appUser.value; w.appUser.value = { ...old, created: { at: 'two' } }; w.appUser.value = old }
      if (change === 'access ABA') { w.ids.value = []; w.ids.value = ['kitchen-a'] }
      if (change === 'disposal') w.scope.stop()
      w.credentials.resolve('old-token'); await assert.rejects(pending, /changed/); assert.equal(w.calls.length, 0); w.scope.stop()
    })
  }
  test(`${kind} preserves exact server success after visible scope changes`, async () => {
    const w = harness(kind, true), pending = w.invoke(); w.credentials.resolve('token'); await Promise.resolve(); await Promise.resolve()
    assert.equal(w.calls.length, 1); w.kitchenId.value = 'kitchen-b'; w.selectedId.value = 'kitchen-b'
    w.response.resolve(result(kind)); assert.equal((await pending).ok, true); assert.equal(w.api.error.value, '')
    if (kind === 'whatsapp') assert.equal(w.api.sent.value, false)
    w.scope.stop()
  })
  test(`${kind} rejects a success for another Kitchen`, async () => {
    const w = harness(kind, true), pending = w.invoke(); w.credentials.resolve('token'); await Promise.resolve(); await Promise.resolve()
    w.response.resolve({ ...result(kind), kitchen_id: 'kitchen-b' }); await assert.rejects(pending, /did not match/); w.scope.stop()
  })
}
test('transition snapshots options before credential wait', async () => {
  const w = harness('transition'), draft = { estimatedMinutes: 15, note: 'Original' }, pending = w.invoke(draft)
  draft.estimatedMinutes = 99; draft.note = 'Changed'; w.credentials.resolve('token'); await pending
  assert.equal(w.calls[0].options.body.estimated_minutes, 15); assert.equal(w.calls[0].options.body.note, 'Original'); w.scope.stop()
})
test('transition duplicate pending action is not a fulfilled no-dispatch success', async () => {
  const w = harness('transition'), pending = w.invoke(); await assert.rejects(w.invoke(), /already/); w.credentials.resolve('token'); await pending; assert.equal(w.calls.length, 1); w.scope.stop()
})
test('an old transition cannot release the new context pending Order', async () => {
  const w = harness('transition', true), first = w.invoke(); w.credentials.resolve('token'); await Promise.resolve(); await Promise.resolve()
  const nextResponse = deferred(); w.response.promise = nextResponse.promise
  w.selectedId.value = 'kitchen-b'; w.selectedId.value = 'kitchen-a'; const second = w.invoke(); await Promise.resolve(); await Promise.resolve()
  w.response.resolve(result('transition')); await first
  assert.equal(w.api.isTransitioning('order-a'), true)
  nextResponse.resolve(result('transition')); await second; assert.equal(w.api.isTransitioning('order-a'), false); w.scope.stop()
})
