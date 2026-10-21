import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, effectScope, reactive, ref, watch } from 'vue'
import { commandScopeDeps } from './command-scope-fixture.mjs'
function load(path, expression, deps) {
  const source = readFileSync(new URL(path, import.meta.url), 'utf8')
    .match(/<script setup lang="ts">([\s\S]*?)<\/script>/)[1]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"];?\n/gm, '')
    .replace(/^export /gm, '')
  return compileFunction(`${stripTypeScriptTypes(source)};return ${expression}`, Object.keys(deps))(...Object.values(deps))
}
function deferred() { let resolve; const promise = new Promise(done => { resolve = done }); return { promise, resolve } }
function payments() {
  const scope = effectScope(), props = reactive({ kitchenId: 'one', canWrite: true, fulfilment: { payment_methods: [] } })
  const gate = deferred(), entered = deferred(), calls = [], owner = ref('one')
  const captureIntent = () => { const captured = owner.value; return () => owner.value === captured }
  const model = scope.run(() => load('../runtime/kitchen/components/Identity/Payments/Methods.vue', '({ updateFunctions })', commandScopeDeps({
    computed, watch, defineProps: () => props,
    useKitchenFulfilmentUpdate: () => ({ captureIntent, updateKitchenFulfilment: async value => {
      calls.push(value); entered.resolve(); if (calls.length === 1) await gate.promise; return { payment_methods: value.changes.payment_methods }
    } }),
  })))
  return { scope, props, owner, gate, entered, calls, model }
}
test('queued payment edits retain their original Kitchen and do not dispatch after selection changes', async () => {
  const s = payments()
  const first = s.model.updateFunctions.collection(['cash'])
  const queued = s.model.updateFunctions.delivery(['online_card'])
  const rejected = assert.rejects(queued, /Kitchen changed/)
  await s.entered.promise
  assert.equal(s.calls.length, 1)
  s.props.kitchenId = 'two'; s.owner.value = 'two'
  s.gate.resolve(); await first; await rejected
  assert.equal(s.calls.length, 1)
  assert.equal(s.calls[0].kitchenId, 'one')
  s.scope.stop()
})
test('queued payment edits merge the prior committed result before the live reader catches up', async () => {
  const s = payments()
  const first = s.model.updateFunctions.collection(['cash'])
  const second = s.model.updateFunctions.delivery(['online_card'])
  await Promise.resolve(); s.gate.resolve(); await first; await second
  assert.deepEqual(s.calls[1].changes.payment_methods, [
    { method: 'cash', order_types: ['collection'] },
    { method: 'online_card', order_types: ['delivery'] },
  ])
  assert.deepEqual(s.props.fulfilment.payment_methods, [])
  s.scope.stop()
})
for (const changed of ['none', 'account', 'membership', 'owner', 'draft', 'disposal'])
  test(`choice completion respects ${changed}`, async () => {
    const scope = effectScope(), reply = deferred(), currentUser = ref({ uid: 'one' }), appUser = ref({ created: { at: 'one' } }), owner = ref('one')
    const props = reactive({ label: 'Payment', options: [{ value: 'cash', label: 'Cash' }], value: [], disabled: false,
      captureIntent: () => { const captured = owner.value; return () => owner.value === captured },
      update: async () => { props.disabled = true; await reply.promise; props.disabled = false },
    })
    const model = scope.run(() => load('../../../../core/fireux-core/src/runtime/components/molecules/forms/editable/ChoiceGroup.vue', '({ startEditing, save, draft, isEditing, saving, effectiveValue })', commandScopeDeps({
      computed, ref, watch, defineProps: () => props, withDefaults: value => value,
      useAuth: () => ({ currentUser }), useUserSession: () => ({ appUser }),
    })))
    model.startEditing(); model.draft.value = ['cash']; const pending = model.save()
    if (changed === 'account') { currentUser.value = null; currentUser.value = { uid: 'one' } }
    if (changed === 'membership') { appUser.value = null; appUser.value = { created: { at: 'one' } } }
    if (changed === 'owner') owner.value = 'two'
    if (changed === 'draft') model.draft.value = []
    if (changed === 'disposal') scope.stop()
    reply.resolve(); await pending
    assert.equal(model.isEditing.value, changed !== 'none')
    assert.deepEqual(model.effectiveValue.value, changed === 'none' ? ['cash'] : [])
    if (changed !== 'disposal') assert.equal(model.saving.value, false)
    scope.stop()
  })
