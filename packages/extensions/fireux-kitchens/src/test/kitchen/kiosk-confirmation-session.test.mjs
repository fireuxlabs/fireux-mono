import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, nextTick, ref, shallowRef, watch } from 'vue'

test('actual kiosk flow retains waiting session, gates printing and resets only after ready', async () => {
  const source = readFileSync(
    new URL(
      '../../runtime/menu/components/Order/KioskOrderFlow.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  let reset = 0,
    cleared = 0,
    printed = 0,
    timer,
    delay
  const events = []
  const order = {
    status: ref({ status: 'pending_acceptance' }),
    sentOrder: ref({ id: 'local-kiosk' }),
    reset: () => reset++,
  }
  const basket = { quantity: ref(1), clear: () => cleared++ }
  const deps = {
    computed,
    nextTick,
    ref,
    shallowRef,
    watch,
    onBeforeUnmount: () => {},
    defineProps: () => ({
      scopeKey: 'local-kiosk',
      orderType: 'takeaway',
      config: null,
    }),
    defineEmits: () => (event) => events.push(event),
    useToast: () => ({ add: () => {} }),
    useMenuOrderBasket: () => basket,
    useMenuOrderKiosk: () => order,
    printKitchenOrderReceipt: () => {
      printed++
      return true
    },
    setTimeout: (fn, ms) => {
      timer = fn
      delay = ms
      return 1
    },
    clearTimeout: () => {
      timer = undefined
    },
  }
  const view = compileFunction(
    `${stripTypeScriptTypes(source)}; return { printReceipt }`,
    Object.keys(deps)
  )(...Object.values(deps))
  for (const status of [
    'pending_acceptance',
    'awaiting_payment_choice',
    'pending_payment',
    'awaiting_preparation',
  ]) {
    order.status.value = { status }
    await nextTick()
    view.printReceipt()
    assert.equal(reset, 0, status)
    assert.equal(printed, 0, status)
    assert.equal(timer, undefined, status)
  }
  order.status.value = { status: 'accepted' }
  await nextTick()
  view.printReceipt()
  assert.equal(printed, 1)
  assert.equal(timer, undefined)
  order.status.value = { status: 'ready' }
  await nextTick()
  assert.equal(delay, 6000)
  timer()
  assert.equal(reset, 1)
  assert.equal(cleared, 1)
  assert.deepEqual(events, ['restart'])
})
