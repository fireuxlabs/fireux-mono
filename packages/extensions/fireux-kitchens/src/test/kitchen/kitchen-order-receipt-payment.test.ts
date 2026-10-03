import assert from 'node:assert/strict'
import test from 'node:test'
import { renderKitchenOrderReceiptHtml } from '../../runtime/kitchen/composables/orders/useKitchenOrderReceiptPrint.ts'
import type { CreatedMenuOrderReceipt } from '../../runtime/menu/models/menu-order-receipt.model.ts'

const receipt = (
  payment?: CreatedMenuOrderReceipt['payment'],
  orderType: CreatedMenuOrderReceipt['order_type'] = 'collection'
): CreatedMenuOrderReceipt => ({
  id: 'receipt-test',
  order_number: '42',
  order_type: orderType,
  channel: 'menu',
  status: 'accepted',
  created_at: '2026-09-08T12:00:00Z',
  currency: 'CHF',
  subtotal_chf: 20,
  total_chf: 20,
  items: [],
  kitchen: { id: 'test-kitchen' },
  menu: { id: 'food' },
  ...(payment ? { payment } : {}),
})

test('deferred collection and kiosk tickets instruct settlement without claiming paid', () => {
  for (const [type, label] of [
    ['collection', 'Pay when you collect'],
    ['eat_in', 'Pay at the counter'],
    ['takeaway', 'Pay at the counter'],
  ] as const) {
    const html = renderKitchenOrderReceiptHtml(
      receipt(
        { required: false, status: 'not_required', method: 'pay_later' },
        type
      )
    )
    assert.ok(html.includes(label))
    assert.ok(html.includes('Payment not recorded.'))
    assert.ok(!html.includes('Payment recorded as paid.'))
  }
})

test('only recorded paid status claims payment and deposit does not imply full settlement', () => {
  assert.ok(
    renderKitchenOrderReceiptHtml(
      receipt({ required: true, status: 'paid', method: 'online_card' })
    ).includes('Payment recorded as paid.')
  )
  const deposit = renderKitchenOrderReceiptHtml(
    receipt({ required: true, status: 'paid', method: 'deposit' })
  )
  assert.ok(
    deposit.includes('Deposit recorded as paid — check remaining balance.')
  )
  assert.ok(!deposit.includes('Payment recorded as paid.'))
})

test('unsettled, refunded and absent payment remain explicit', () => {
  for (const status of [
    'requires_payment',
    'pending',
    'failed',
    'cancelled',
    'refunded',
  ] as const) {
    const html = renderKitchenOrderReceiptHtml(
      receipt({ required: true, status, method: 'online_card' })
    )
    assert.ok(!html.includes('Payment recorded as paid.'))
    assert.ok(
      html.includes(
        status === 'refunded' ? 'Payment refunded.' : 'not recorded as paid.'
      )
    )
  }
  assert.ok(
    renderKitchenOrderReceiptHtml(receipt()).includes('Payment not recorded.')
  )
})

test('payment metadata cannot inject receipt markup', () => {
  const value = receipt({
    required: false,
    status: 'not_required',
    method: 'cash',
    reason: '<img src=x onerror=alert(1)>',
  })
  value.customer = { name: '<script>alert(1)</script>' }
  const html = renderKitchenOrderReceiptHtml(value)
  assert.ok(html.includes('Pay when you collect'))
  assert.ok(html.includes('&lt;script&gt;alert(1)&lt;/script&gt;'))
  assert.ok(!html.includes('<img src=x'))
  assert.ok(!html.includes('<script>alert(1)</script>'))
})

test('room service only says charge to room when that method was selected', () => {
  for (const method of [
    'cash',
    'card_at_pickup',
    'card_to_driver',
    'pay_later',
  ] as const) {
    const html = renderKitchenOrderReceiptHtml(
      receipt(
        { required: false, status: 'not_required', method },
        'room_service'
      )
    )
    assert.ok(html.includes('Pay later'))
    assert.ok(!html.includes('Charge to room'))
  }
  const charged = renderKitchenOrderReceiptHtml(
    receipt(
      { required: false, status: 'not_required', method: 'room_charge' },
      'room_service'
    )
  )
  assert.ok(charged.includes('Charge to room'))
  assert.ok(charged.includes('Payment not recorded.'))
})
