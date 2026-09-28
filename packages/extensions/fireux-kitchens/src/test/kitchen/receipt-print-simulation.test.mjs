import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref, watch } from 'vue'
import {
  kitchenOrderPaymentMethodLabel,
  menuOrderPaymentLabel,
} from '../../runtime/menu/utils/menu-order-payment.ts'

const source = (path) =>
  readFileSync(new URL(`../../runtime/${path}`, import.meta.url), 'utf8')
    .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
    .replace(/^export /gm, '')
    .replaceAll('import.meta.client', 'true')
const printer = compileFunction(
  `${stripTypeScriptTypes(source('kitchen/composables/workspace/orders/useKitchenOrderReceiptPrint.ts'))}; return {printKitchenOrderTicket}`,
  ['kitchenOrderPaymentMethodLabel', 'menuOrderPaymentLabel']
)(kitchenOrderPaymentMethodLabel, menuOrderPaymentLabel)

// In-memory operator context and captured document only: no Firebase, browser.print or network.
const fixture = () => ({
  id: 'local-print-simulation',
  kitchen_id: 'local-fixture',
  menu_id: 'food',
  service_number: 'SIM-001',
  order_number: 'SIM-001',
  order_type: 'collection',
  status: 'pending_acceptance',
  channel: 'menu',
  created: { at: '2026-09-29T13:00:00Z' },
  requested_for: '2026-09-29T14:00:00Z',
  customer: {
    name: 'Bären — LOCAL SIMULATION — DO NOT PREPARE',
    notes: 'No connected order. No physical printer. No payment or revenue.',
  },
  items: [
    {
      id: 'pizza',
      menu_id: 'food',
      label: 'Pizza Margherita',
      quantity: 1,
      unit_price: 18,
      add_ons: [{ id: 'fixture-cheese', label: 'mit Käserand', price: 5 }],
    },
  ],
  payment: {
    required: false,
    status: 'not_required',
    method: 'pay_later',
    amount_chf: 18,
    currency_code: 'CHF',
  },
})
function simulation(mode) {
  const order = fixture(),
    captures = [],
    events = []
  const orders = ref([order])
  const target = (failure = false) => ({
    closed: false,
    close() {
      events.push('window closed')
    },
    document: {
      open() {},
      write(html) {
        if (failure) throw new Error('simulated spool failure')
        captures.push(html)
        events.push('HTML dispatched to local capture')
      },
      close() {},
    },
  })
  const script = source('kitchen/components/Workspace/Orders/Incoming.vue')
    .split('<script setup lang="ts">')[1]
    .split('</script>')[0]
  const flow = compileFunction(
    `${stripTypeScriptTypes(script)}; return {acceptIncomingOrder,acceptIncomingOrders,printWarnings}`,
    [
      'computed',
      'ref',
      'watch',
      'onMounted',
      'onBeforeUnmount',
      'defineOptions',
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
    () => ({
      incomingOrders: orders,
      canOperate: ref(true),
      canInteract: (item) => item.status === 'pending_acceptance',
      normalizeId: String,
      acceptOrder: async () => {
        assert.equal(order.status, 'pending_acceptance')
        order.status = 'accepted'
        events.push('local acceptance')
      },
      rejectOrder: async () => {},
    }),
    () => {
      events.push('reserve simulated window')
      return mode === 'blocked' ? null : target(mode === 'failed')
    },
    printer.printKitchenOrderTicket
  )
  return {
    order,
    captures,
    events,
    flow,
    retry: () => {
      events.push('manual print retry; no second acceptance')
      return printer.printKitchenOrderTicket(order, target())
    },
  }
}

test('real operator acceptance and receipt dispatch: success, blocked/failed then manual retry, duplicates', async () => {
  const evidence = []
  for (const mode of ['success', 'blocked', 'failed']) {
    const h = simulation(mode)
    const payload = { id: h.order.id, estimatedMinutes: 20 }
    await h.flow.acceptIncomingOrders([payload, payload])
    assert.equal(h.events.filter((e) => e === 'local acceptance').length, 1)
    assert.equal(h.order.status, 'accepted')
    assert.equal(h.order.payment.status, 'not_required')
    assert.equal(h.captures.length, mode === 'success' ? 1 : 0)
    if (mode !== 'success') {
      assert.deepEqual(h.flow.printWarnings.value, ['SIM-001'])
      assert.equal(h.retry(), true)
      assert.equal(h.captures.length, 1)
    }
    await h.flow.acceptIncomingOrder(payload)
    assert.equal(h.events.filter((e) => e === 'local acceptance').length, 1)
    assert.equal(h.captures.length, 1)
    const html = h.captures[0]
    for (const text of [
      'SIM-001',
      'Pizza Margherita',
      '+ mit Käserand',
      'DO NOT PREPARE',
      'Pickup:',
      'Pay when you collect',
      'Payment not recorded.',
      'CHF',
    ])
      assert.ok(html.includes(text), text)
    assert.ok(!html.includes('Payment recorded as paid.'))
    const date = new Intl.DateTimeFormat('en-GB', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(h.order.requested_for))
    assert.ok(html.includes(date))
    evidence.push({
      mode,
      events: h.events,
      warning: h.flow.printWarnings.value,
      payment: h.order.payment.status,
      physicalPrintAcknowledged: false,
    })
    if (process.env.FIREUX_PRINT_CAPTURE_DIR && mode === 'success') {
      mkdirSync(process.env.FIREUX_PRINT_CAPTURE_DIR, { recursive: true })
      // Preview only: remove automatic print invocation. All visible ticket markup is the real renderer output.
      writeFileSync(
        `${process.env.FIREUX_PRINT_CAPTURE_DIR}/ticket.html`,
        html.replace(/<script>[\s\S]*?<\/script>/, '')
      )
    }
  }
  if (process.env.FIREUX_PRINT_CAPTURE_DIR)
    writeFileSync(
      `${process.env.FIREUX_PRINT_CAPTURE_DIR}/evidence.json`,
      JSON.stringify(evidence, null, 2)
    )
})

test('confirmation-first tickets cannot print before preparation or without a satisfied payment gate', () => {
  for (const status of [
    'pending_acceptance',
    'awaiting_payment_choice',
    'pending_payment',
    'scheduled',
    'awaiting_preparation',
  ]) {
    const order = {
      ...fixture(),
      status,
      payment: {
        flow: 'confirmation_first',
        required: false,
        status: 'not_required',
        method: 'pay_later',
      },
    }
    let touched = 0
    const target = {
      close() {},
      get document() {
        touched++
        throw new Error('must not print')
      },
    }
    assert.equal(printer.printKitchenOrderTicket(order, target), false)
    assert.equal(touched, 0)
  }
  const unpaidOnline = {
    ...fixture(),
    status: 'accepted',
    payment: {
      flow: 'confirmation_first',
      required: true,
      status: 'pending',
      method: 'online_card',
    },
  }
  let touched = 0
  assert.equal(
    printer.printKitchenOrderTicket(unpaidOnline, {
      close() {},
      get document() {
        touched++
        throw new Error('must not print')
      },
    }),
    false
  )
  assert.equal(touched, 0)
})
