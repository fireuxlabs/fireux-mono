import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, toValue } from 'vue'

function harness() {
  let resolveToken
  const token = new Promise(resolve => { resolveToken = resolve })
  const currentUser = ref({ uid: 'operator-a', getIdToken: () => token })
  const selectedId = ref('kitchen-a')
  const appId = ref('app-a')
  const calls = []
  let allowed = true
  const dependencies = {
    computed, ref, toValue,
    useAuth: () => ({ currentUser }),
    useWorkspace: () => ({ selectedId }),
    useWorkspaceWriteGuard: () => ({ requireWritableData() { if (!allowed) throw new Error('Access revoked') } }),
    $fetch: async (...args) => { calls.push(args); return { ok: true } },
  }
  const source = readFileSync(new URL('../../runtime/kitchen/composables/workspace/orders/useKitchenOrderTransition.ts', import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '').replace(/^export /gm, '')
  const create = compileFunction(`${stripTypeScriptTypes(source)}; return useKitchenOrderTransition`, Object.keys(dependencies))(...Object.values(dependencies))
  return { state: create({ appId }), currentUser, selectedId, appId, calls, resolveToken, revoke() { allowed = false } }
}

test('operator actions retain one server command and exact captured scope', async () => {
  for (const action of ['accept', 'start_preparation', 'mark_ready', 'return_to_queue', 'complete']) {
    const h = harness()
    const pending = h.state.transitionKitchenOrder('kitchen-a', 'order-a', action)
    assert.equal(h.state.isTransitioning('order-a'), true)
    h.resolveToken('test-token')
    await pending
    assert.equal(h.calls.length, 1)
    assert.equal(h.calls[0][0], '/api/workspace/kitchen/orders/transition')
    assert.deepEqual(h.calls[0][1].body, { app_id: 'app-a', kitchen_id: 'kitchen-a', order_id: 'order-a', transition: action })
    assert.equal(h.state.isTransitioning('order-a'), false)
  }
})

test('account, Kitchen, App and revoked access changes prevent operator dispatch', async () => {
  for (const change of ['account', 'signout', 'kitchen', 'app', 'access']) {
    const h = harness()
    const pending = h.state.transitionKitchenOrder('kitchen-a', 'order-a', 'accept')
    const rejection = assert.rejects(pending, /changed|revoked/)
    if (change === 'account') h.currentUser.value = { uid: 'operator-b' }
    if (change === 'signout') h.currentUser.value = null
    if (change === 'kitchen') h.selectedId.value = 'kitchen-b'
    if (change === 'app') h.appId.value = 'app-b'
    if (change === 'access') h.revoke()
    h.resolveToken('old-test-token')
    await rejection
    assert.equal(h.calls.length, 0, change)
    assert.equal(h.state.pendingCount.value, 0)
  }
})
