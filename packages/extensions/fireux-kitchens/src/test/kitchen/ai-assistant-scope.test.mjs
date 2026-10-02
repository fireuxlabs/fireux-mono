import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, reactive, ref, watch } from 'vue'

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => {
    resolve = yes
    reject = no
  })
  return { promise, resolve, reject }
}
function harness({ slowToken = false } = {}) {
  const scope = effectScope(),
    token = deferred(),
    requests = [],
    actions = []
  const currentUser = ref({
    uid: 'one',
    getIdToken: () => (slowToken ? token.promise : Promise.resolve('token')),
  })
  const props = reactive({
    kitchenId: 'a',
    operation: 'waste',
    availableActions: ['kitchen.waste.record-event'],
    actionTargets: [],
    performAction: async (...args) => {
      actions.push(args)
      return true
    },
  })
  let unmount
  const dependencies = {
    computed,
    ref,
    watch,
    onBeforeUnmount: (fn) => {
      unmount = fn
    },
    defineProps: () => props,
    withDefaults: (value) => value,
    useAuth: () => ({ currentUser }),
    useRequireUser: async () => currentUser.value,
    useFireUXConfig: () => ({ appId: 'app', appName: 'App' }),
    useKitchenAIPresentation: () => ({
      operation: computed(() => props.operation),
      commandMode: ref(true),
    }),
    $fetch: (...args) => {
      const response = deferred()
      requests.push({ args, ...response })
      return response.promise
    },
  }
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Workspace/AI/Assistant.vue',
      import.meta.url
    ),
    'utf8'
  )
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const create = compileFunction(
    `${stripTypeScriptTypes(source)}; return { runPrompt, confirmCommand, resetCommand, pendingTool, commandResult, submitting, prompt, messages }`,
    Object.keys(dependencies)
  )
  const state = scope.run(() => create(...Object.values(dependencies)))
  return {
    state,
    props,
    currentUser,
    requests,
    actions,
    token,
    stop() {
      unmount()
      scope.stop()
    },
  }
}
const tick = async () => {
  for (let i = 0; i < 5; i++) await Promise.resolve()
}
const pending = {
  id: 'tool',
  name: 'Tool',
  input: { name: 'Alex' },
  confirmation: 'Confirm?',
}

test('current request and confirmation retain captured Kitchen and tool', async () => {
  const h = harness()
  const first = h.state.runPrompt('Add Alex')
  await tick()
  h.requests[0].resolve({ answer: 'Review Alex', pendingTool: pending })
  await first
  const confirmation = h.state.confirmCommand()
  await tick()
  assert.equal(h.requests[1].args[1].body.kitchenId, 'a')
  assert.deepEqual(h.requests[1].args[1].body.pendingTool, pending)
  h.requests[1].resolve({ answer: 'Done' })
  await confirmation
  assert.equal(h.state.pendingTool.value, null)
  assert.equal(h.state.commandResult.value.text, 'Done')
  h.stop()
})
test('Kitchen/account changes during credentials prevent dispatch, even away-and-back', async () => {
  for (const change of ['kitchen', 'account']) {
    const h = harness({ slowToken: true })
    const work = h.state.runPrompt('Record waste')
    await tick()
    if (change === 'kitchen') {
      h.props.kitchenId = 'b'
      h.props.kitchenId = 'a'
    } else {
      h.currentUser.value = null
      h.currentUser.value = { uid: 'one' }
    }
    h.token.resolve('old-token')
    await work
    assert.equal(h.requests.length, 0)
    assert.equal(h.state.submitting.value, false)
    h.stop()
  }
})
test('stale response cannot execute action, revive confirmation or clear newer pending state', async () => {
  const h = harness()
  const old = h.state.runPrompt('Old action')
  await tick()
  h.props.kitchenId = 'b'
  const fresh = h.state.runPrompt('New action')
  await tick()
  h.requests[0].resolve({
    answer: 'Old',
    pendingTool: pending,
    workspaceAction: { id: 'kitchen.waste.record-event' },
  })
  await old
  assert.deepEqual(h.actions, [])
  assert.equal(h.state.pendingTool.value, null)
  assert.equal(h.state.submitting.value, true)
  h.requests[1].resolve({ answer: 'New' })
  await fresh
  assert.equal(h.state.commandResult.value.text, 'New')
  h.stop()
})
test('account switch invalidates a visible confirmation before it can be submitted', async () => {
  const h = harness()
  const work = h.state.runPrompt('Add Alex')
  await tick()
  h.requests[0].resolve({ answer: 'Review', pendingTool: pending })
  await work
  h.currentUser.value = { uid: 'two' }
  await h.state.confirmCommand()
  assert.equal(h.requests.length, 1)
  assert.equal(h.state.pendingTool.value, null)
  assert.equal(h.state.commandResult.value, null)
  h.stop()
})
test('unmount invalidates late failures', async () => {
  const h = harness()
  const work = h.state.runPrompt('Hello')
  await tick()
  h.stop()
  h.requests[0].reject(new Error('obsolete error'))
  await work
  assert.equal(h.state.commandResult.value, null)
})
