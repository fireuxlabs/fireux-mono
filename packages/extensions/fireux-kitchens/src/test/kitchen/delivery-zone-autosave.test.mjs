import assert from 'node:assert/strict'
import test from 'node:test'
import * as vue from 'vue'
import { useCommandScope } from '../../../../../core/fireux-core/src/runtime/composables/fireux/commands/useCommandScope.ts'
import { loadOfferingSource } from '../offering-test-helpers.mjs'
function harness() {
  const scope = vue.effectScope(),
    zones = vue.ref([{ id: 'a', label: 'Town', radius_m: 1500, fee_chf: 3 }]),
    syncing = vue.ref(false),
    kitchen = vue.ref('k'),
    canWrite = vue.ref(true),
    calls = [],
    timers = new Map()
  let id = 0,
    fail = false
  const { useDeliveryZoneAutosave } = loadOfferingSource(
    'kitchen/composables/workspace/fulfilment/useDeliveryZoneAutosave',
    'useDeliveryZoneAutosave',
    {
      ...vue,
      useCommandScope,
      normalizedZone: (row) => (row.label ? { ...row } : null),
      setTimeout: (fn) => {
        timers.set(++id, fn)
        return id
      },
      clearTimeout: (key) => timers.delete(key),
    }
  )
  const state = scope.run(() =>
    useDeliveryZoneAutosave({
      zones,
      syncing,
      kitchenId: () => kitchen.value,
      canWrite: () => canWrite.value,
      captureIntent: () => () => true,
      update: async (rows) => {
        if (fail) throw Error('Connection failed')
        calls.push(rows)
      },
    })
  )
  return {
    scope,
    zones,
    syncing,
    kitchen,
    canWrite,
    calls,
    state,
    timers,
    fail: () => {
      fail = true
    },
    flush: async () => {
      const callbacks = [...timers.values()]
      timers.clear()
      for (const fn of callbacks) await fn()
    },
  }
}
test('mounting and live hydration never rewrite delivery fees', async () => {
  const h = harness()
  await h.flush()
  assert.equal(h.calls.length, 0)
  h.syncing.value = true
  h.zones.value = [{ label: 'Town', radius_m: 2000, fee_chf: 3 }]
  h.syncing.value = false
  await h.flush()
  assert.equal(h.calls.length, 0)
  h.scope.stop()
})
test('deliberate area edits coalesce and preserve unchanged prices', async () => {
  const h = harness()
  h.zones.value[0].label = 'Town centre'
  h.zones.value[0].radius_m = 2000
  assert.equal(h.timers.size, 1)
  await h.flush()
  assert.equal(h.calls.length, 1)
  assert.equal(h.calls[0][0].fee_chf, 3)
  assert.equal(h.calls[0][0].radius_m, 2000)
  h.scope.stop()
})
test('incomplete geometry and invalid fees never delete or replace saved areas', async () => {
  const h = harness()
  h.zones.value[0].radius_m = 0
  await h.flush()
  assert.equal(h.calls.length, 0)
  h.zones.value[0].radius_m = 1500
  h.zones.value[0].fee_chf = -1
  await h.flush()
  assert.equal(h.calls.length, 0)
  assert.match(h.state.status.value, /Complete/)
  h.scope.stop()
})
test('scope changes and disposal cancel queued area changes', async () => {
  for (const change of ['kitchen', 'access', 'dispose']) {
    const h = harness()
    h.zones.value[0].label = 'Changed'
    if (change === 'kitchen') h.kitchen.value = 'other'
    if (change === 'access') h.canWrite.value = false
    if (change === 'dispose') h.scope.stop()
    await h.flush()
    assert.equal(h.calls.length, 0, change)
    h.scope.stop()
  }
})
test('area write failures are visible and keep the authored values for correction', async () => {
  const h = harness()
  h.fail()
  h.zones.value[0].label = 'Changed'
  await h.flush()
  assert.equal(h.state.error.value, 'Connection failed')
  assert.equal(h.zones.value[0].label, 'Changed')
  assert.equal(h.state.saving.value, false)
  h.scope.stop()
})
