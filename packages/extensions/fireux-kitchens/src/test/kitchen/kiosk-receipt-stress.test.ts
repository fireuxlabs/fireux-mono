import assert from 'node:assert/strict'
import test from 'node:test'
import { renderKitchenOrderReceiptHtml } from '../../runtime/kitchen/composables/orders/useKitchenOrderReceiptPrint.ts'
import { applyKitchenOrderServiceSequence } from '../../runtime/kitchen/utils/order-service-sequence.ts'
import type { CreatedMenuOrderReceipt } from '../../runtime/menu/models/menu-order-receipt.model.ts'

const receipt = (itemCount: number): CreatedMenuOrderReceipt => ({
  id: 'stress-order',
  order_number: '1',
  order_type: 'takeaway',
  channel: 'kiosk',
  status: 'accepted',
  created_at: '2026-08-30T12:00:00.000Z',
  currency: 'CHF',
  subtotal_chf: itemCount * 12.5,
  total_chf: itemCount * 12.5,
  items: Array.from({ length: itemCount }, (_, index) => ({
    id: `line-${index + 1}`,
    label:
      index === 0
        ? '<script>throw new Error("receipt injection")</script>'
        : `Pizza ${index + 1}`,
    quantity: 1,
    unit_price_chf: 12.5,
    total_chf: 12.5,
  })),
  kitchen: { id: 'interlaken-pizza' },
  menu: { id: 'pizza-menu' },
})

test('10,000 Kiosk orders retain unique service and receipt numbers', () => {
  const numbers = new Set<number>()

  for (let number = 1; number <= 10_000; number += 1) {
    const projected = applyKitchenOrderServiceSequence({
      payload: { channel: 'kiosk' },
      response: { receipt: receipt(1) },
      sequence: { id: 'stress-service', number },
    })
    const projectedReceipt = projected.response.receipt as Record<
      string,
      unknown
    >

    numbers.add(projected.payload.service_number as number)
    assert.equal(projected.payload.order_number, String(number))
    assert.equal(projectedReceipt.order_number, String(number))
    assert.equal(projectedReceipt.service_id, 'stress-service')
  }

  assert.equal(numbers.size, 10_000)
})

test('large Kiosk receipts render every line and escape untrusted content', () => {
  const html = renderKitchenOrderReceiptHtml(receipt(500))

  const tickets = [...html.matchAll(/<article[^>]*>([\s\S]*?)<\/article>/g)]
  assert.equal(tickets.length, 2)
  for (const [, ticket] of tickets) {
    assert.equal((ticket.match(/<tr>/g) || []).length, 500)
    assert.match(ticket, /Pizza 500/)
  }
  assert.match(html, /&lt;script&gt;throw new Error/)
  assert.doesNotMatch(html, /<script>throw new Error\("receipt injection"\)/)
  assert.match(html, /Pizza 500/)
  assert.ok(html.length < 250_000)
})
