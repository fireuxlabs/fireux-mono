import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch } from 'vue'
import { canPrintKitchenOrderTicket } from '../../runtime/kitchen/models/order-lifecycle.model.ts'

function harness(
  options: {
    blocked?: number[]
    failAccept?: boolean
    failPrint?: boolean
    scheduled?: boolean
    confirmationFirst?: boolean
  } = {}
) {
  const events: string[] = []
  let opened = 0
  const orders = ref([
    {
      id: 'one',
      order_number: '1',
      order_type: 'collection',
      payment:
        options.scheduled || options.confirmationFirst
          ? { flow: 'confirmation_first' }
          : {},
      collection: { mode: options.scheduled ? 'scheduled' : 'queue' },
    },
    { id: 'two', order_number: '2' },
  ])
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/components/Workspace/Orders/Incoming.vue',
      import.meta.url
    ),
    'utf8'
  )
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  const flow = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn { acceptIncomingOrder, acceptIncomingOrders, printWarnings }`,
    [
      'computed',
      'ref',
      'watch',
      'onMounted',
      'onBeforeUnmount',
      'defineOptions',
      'useAuth',
      'useFireUXConfig',
      'useUserSession',
      'useKitchenOrdersContext',
      'openKitchenOrderPrintWindow',
      'printKitchenOrderTicket',
    ]
  )(
    computed,
    ref,
    watch,
    () => {},
    () => {},
    () => {},
    () => ({ currentUser: ref({uid:'operator'}) }),
    () => ({ appId:'fixture-app' }),
    () => ({ appUser: ref({role:'user'}) }),
    () => ({
      kitchenId: ref('fixture-kitchen'),
      captureIntent: () => () => true,
      incomingOrders: orders,
      canOperate: ref(true),
      canInteract: (order: { id: string }) => order.id !== 'ineligible',
      normalizeId: (value: unknown) => String(value || '').trim(),
      acceptOrder: async (id: string) => {
        events.push(`accept:${id}`)
        if (options.failAccept) throw new Error('Rejected')
      },
      rejectOrder: async () => {},
    }),
    () => {
      const index = opened++
      events.push(`open:${index}`)
      return options.blocked?.includes(index)
        ? null
        : { close: () => events.push(`close:${index}`) }
    },
    (order: { id: string }, target: unknown) => {
      events.push(`print:${order.id}`)
      if (options.failPrint) throw new Error('Print failed')
      return Boolean(target)
    }
  )
  return { flow, events, orders }
}

test('Accept reserves before transition and prints only after acceptance', async () => {
  const h = harness()
  await h.flow.acceptIncomingOrder({ id: 'one', estimatedMinutes: 20 })
  assert.deepEqual(h.events, ['open:0', 'accept:one', 'print:one'])
  assert.deepEqual(h.flow.printWarnings.value, [])
})

test('failed acceptance closes reserved window and never prints', async () => {
  const h = harness({ failAccept: true })
  await h.flow.acceptIncomingOrder({ id: 'one', estimatedMinutes: 20 })
  assert.deepEqual(h.events, ['open:0', 'accept:one', 'close:0'])
  assert.deepEqual(h.flow.printWarnings.value, [])
})

test('blocked or failed printing preserves acceptance and exposes manual recovery', async () => {
  for (const options of [{ blocked: [0] }, { failPrint: true }]) {
    const h = harness(options)
    await h.flow.acceptIncomingOrder({ id: 'one', estimatedMinutes: 20 })
    assert.equal(h.events.filter((event) => event === 'accept:one').length, 1)
    assert.deepEqual(h.flow.printWarnings.value, ['1'])
  }
})

test('bulk reserves before awaiting, skips duplicates/ineligible and reports partially blocked print', async () => {
  const h = harness({ blocked: [1] })
  h.orders.value.push({ id: 'ineligible', order_number: '3' })
  await h.flow.acceptIncomingOrders(
    ['one', 'two', 'one', 'missing', 'ineligible'].map((id) => ({
      id,
      estimatedMinutes: 20,
    }))
  )
  assert.deepEqual(h.events, [
    'open:0',
    'open:1',
    'accept:one',
    'print:one',
    'accept:two',
    'print:two',
  ])
  assert.deepEqual(h.flow.printWarnings.value, ['2'])
})

test('reserved print target is reused and a blocked target never opens late', () => {
  const source = readFileSync(
    new URL(
      '../../runtime/kitchen/composables/orders/useKitchenOrderReceiptPrint.ts',
      import.meta.url
    ),
    'utf8'
  )
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
  let opens = 0
  const utility = compileFunction(
    `${stripTypeScriptTypes(source)}\nreturn printKitchenOrderTicket`,
    ['window', 'kitchenOrderPaymentMethodLabel', 'menuOrderPaymentLabel', 'canPrintKitchenOrderTicket']
  )(
    {
      open: () => {
        opens++
        return null
      },
    },
    () => 'Pay later',
    () => 'Pay later',
    canPrintKitchenOrderTicket
  )
  const order = {
    id: 'one',
    items: [],
    payment: { status: 'not_required', currency_code: 'CHF' },
    created: { at: '' },
    order_type: 'collection',
  }
  let writes = 0
  const target = {
    closed: false,
    document: {
      open() {},
      write() {
        writes++
      },
      close() {},
    },
  }
  assert.equal(utility(order, target), true)
  assert.equal(utility(order, null), false)
  assert.equal(utility(order, { ...target, closed: true }), false)
  assert.equal(opens, 0)
  assert.equal(writes, 1)
})

test('scheduled pickup confirmation opens no print window and never prints', async () => {
  const h = harness({ scheduled: true })
  await h.flow.acceptIncomingOrder({ id: 'one', estimatedMinutes: 20 })
  assert.deepEqual(h.events, ['accept:one'])
  assert.deepEqual(h.flow.printWarnings.value, [])
})

test('bulk confirmation does not reserve a printer for scheduled pickup', async () => {
  const h = harness({ scheduled: true })
  await h.flow.acceptIncomingOrders([{ id: 'one', estimatedMinutes: 20 }])
  assert.deepEqual(h.events, ['accept:one'])
})

test('ASAP confirmation-first acceptance also never reserves or prints', async () => {
  const h = harness({ confirmationFirst: true })
  await h.flow.acceptIncomingOrder({ id: 'one', estimatedMinutes: 20 })
  assert.deepEqual(h.events, ['accept:one'])
})
