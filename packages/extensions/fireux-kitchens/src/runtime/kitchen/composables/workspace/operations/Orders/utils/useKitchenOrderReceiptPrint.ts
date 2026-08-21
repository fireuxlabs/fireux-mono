import type {
  CreatedMenuOrder,
  CreatedMenuOrderReceipt,
} from '../../../../../../menu/models/menu-ordering.model.ts'
import type { KitchenOrder } from '../../../../../models/order.model.ts'

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const money = (value: unknown) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency: 'CHF',
  }).format(Number(value || 0))

const orderTypeLabel = (value: string) =>
  ({
    collection: 'Collection',
    delivery: 'Delivery',
    dine_in: 'Table service',
    eat_in: 'Eat here',
    takeaway: 'Take away',
    pre_order: 'Pre-order',
    room_service: 'Room service',
  })[value] || value.replace(/[_-]+/g, ' ')

const formatCreatedAt = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

const renderReceiptHtml = (receipt: CreatedMenuOrderReceipt) => {
  const customerLines = [
    receipt.customer?.name,
    receipt.customer?.phone,
    receipt.customer?.address,
    receipt.customer?.allergy_note
      ? `Allergy: ${receipt.customer.allergy_note}`
      : '',
    receipt.customer?.notes ? `Notes: ${receipt.customer.notes}` : '',
  ].filter(Boolean)
  const rows = receipt.items
    .map((item) => {
      const detailLines = [
        item.variant_label && !item.label.includes(item.variant_label)
          ? item.variant_label
          : '',
        ...(item.add_ons || []).map((addOn) => `+ ${addOn.label}`),
      ].filter(Boolean)

      return `
      <tr>
        <td class="qty">${escapeHtml(item.quantity)}x</td>
        <td>
          <strong>${escapeHtml(item.label)}</strong>
          ${
            detailLines.length
              ? `<small>${detailLines.map(escapeHtml).join('<br>')}</small>`
              : ''
          }
        </td>
        <td class="money">${escapeHtml(money(item.total_chf))}</td>
      </tr>
    `
    })
    .join('')

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order ${escapeHtml(receipt.order_number)}</title>
  <style>
    @page {
      margin: 8mm;
      size: 80mm auto;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #111827;
      font: 12px/1.35 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    }

    h1,
    p {
      margin: 0;
    }

    h1 {
      font-size: 18px;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .receipt {
      width: 100%;
    }

    .header,
    .section,
    .totals {
      padding-block: 10px;
      border-bottom: 1px dashed #9ca3af;
    }

    .meta,
    small {
      display: block;
      margin-top: 4px;
      color: #4b5563;
      font-size: 10px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    td {
      padding: 6px 0;
      vertical-align: top;
    }

    .qty {
      width: 24px;
      font-weight: 700;
    }

    .money {
      width: 58px;
      text-align: right;
      white-space: nowrap;
    }

    .totals p {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }

    .total {
      margin-top: 6px;
      font-size: 14px;
      font-weight: 800;
    }
  </style>
</head>
<body>
  <main class="receipt">
    <section class="header">
      <h1>Order ticket</h1>
      <p class="meta">Order ${escapeHtml(receipt.order_number)}</p>
      <p class="meta">${escapeHtml(orderTypeLabel(receipt.order_type))} · ${escapeHtml(formatCreatedAt(receipt.created_at))}</p>
    </section>

    ${
      customerLines.length
        ? `<section class="section">${customerLines
            .map((line) => `<p>${escapeHtml(line)}</p>`)
            .join('')}</section>`
        : ''
    }

    <section class="section">
      <table>
        <tbody>${rows}</tbody>
      </table>
    </section>

    <section class="totals">
      <p><span>Subtotal</span><span>${escapeHtml(money(receipt.subtotal_chf))}</span></p>
      ${
        receipt.delivery_fee_chf
          ? `<p><span>Delivery</span><span>${escapeHtml(money(receipt.delivery_fee_chf))}</span></p>`
          : ''
      }
      <p class="total"><span>Total</span><span>${escapeHtml(money(receipt.total_chf))}</span></p>
    </section>
  </main>
  <script>
    window.addEventListener('load', function () {
      window.focus();
      window.print();
    });
  </script>
</body>
</html>`
}

export function printKitchenOrderReceipt(order: CreatedMenuOrder | null) {
  if (!import.meta.client || !order?.receipt) return false

  return printReceipt(order.receipt)
}

export function printKitchenOrderTicket(order: KitchenOrder) {
  const subtotal = order.items.reduce(
    (sum, item) =>
      sum + Number(item.unit_price || 0) * Number(item.quantity || 0),
    0
  )
  const total = Number(order.payment.amount_chf || subtotal)
  const receipt: CreatedMenuOrderReceipt = {
    id: order.id,
    order_number: String(
      order.service_number || order.order_number || order.id
    ),
    order_type: order.order_type,
    channel: order.channel || 'menu',
    status: order.status,
    created_at: timestampIso(order.created.at),
    requested_for: timestampIso(order.requested_for),
    currency: order.payment.currency_code || 'CHF',
    subtotal_chf: subtotal,
    total_chf: total,
    payment: order.payment,
    customer: order.customer,
    fulfilment_match: order.fulfilment_match,
    items: order.items.map((item) => {
      const unitPrice = Number(item.unit_price || 0)

      return {
        id: item.id,
        menu_id: item.menu_id,
        label: item.label,
        quantity: Number(item.quantity || 0),
        unit_price_chf: unitPrice,
        total_chf: unitPrice * Number(item.quantity || 0),
        add_ons: item.add_ons,
        variant_label: item.variant_label,
      }
    }),
    kitchen: { id: order.kitchen_id },
    menu: { id: order.menu_id },
  }

  return printReceipt(receipt)
}

function printReceipt(receipt: CreatedMenuOrderReceipt) {
  if (!import.meta.client) return false

  const target = window.open('', '_blank', 'width=420,height=720')
  if (!target) return false

  target.document.open()
  target.document.write(renderReceiptHtml(receipt))
  target.document.close()

  return true
}

function timestampIso(value: unknown) {
  if (typeof value === 'string') return value
  if (!value || typeof value !== 'object') return ''

  const timestamp = value as {
    seconds?: number
    _seconds?: number
    toDate?: () => Date
  }

  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString()
  }

  const seconds = Number(timestamp.seconds ?? timestamp._seconds ?? 0)
  return seconds ? new Date(seconds * 1000).toISOString() : ''
}
