import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { stripTypeScriptTypes } from 'node:module'
import { compileFunction } from 'node:vm'
import { computed, ref } from 'vue'
const source = readFileSync(
  new URL(
    '../../runtime/kitchen/composables/workspace/orders/useKitchenOrderTicket.ts',
    import.meta.url
  ),
  'utf8'
)
  .replace(/^import[\s\S]*?from ['"][^'"]+['"]\n/gm, '')
  .replace(/^export /gm, '')
  .replaceAll('import.meta.client', 'false')
const useTicket = compileFunction(
  `${stripTypeScriptTypes(source)};return useKitchenOrderTicket`,
  ['computed', 'ref', 'kitchenOrderTicketFooterLabel']
)(computed, ref, () => '')
test('operator cash instructions follow pickup or delivery without claiming settlement', () => {
  for (const [order_type, label] of [
    ['collection', 'cash at pickup'],
    ['delivery', 'cash on delivery'],
    ['eat_in', 'cash'],
  ]) {
    const ticket = useTicket(
      {
        order: {
          order_type,
          payment: { method: 'cash', status: 'not_required' },
        },
      },
      () => {}
    )
    assert(ticket.customerLines.value.includes(`Payment ${label}`))
    assert(!ticket.customerLines.value.some((line) => line.includes('paid')))
  }
})
