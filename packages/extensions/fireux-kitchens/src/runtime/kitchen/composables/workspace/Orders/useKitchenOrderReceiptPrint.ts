import {
  kitchenOrderPaymentMethodLabel,
  menuOrderPaymentLabel,
} from '../../../../menu/utils/menu-order-payment.ts'
import type {
  CreatedMenuOrder,
  CreatedMenuOrderReceipt,
} from '../../../../menu/models/menu-order-receipt.model.ts'
import type { KitchenOrder } from '../../../utils/order.ts'

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const money = (value: unknown, currency: string) =>
  new Intl.NumberFormat('de-CH', {
    style: 'currency',
    currency,
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

const receiptPaymentLines = (receipt: CreatedMenuOrderReceipt): string[] => {
  const payment = receipt.payment
  if (!payment) return ['Payment not recorded.']

  const status =
    {
      not_required: 'Payment not recorded.',
      requires_payment: 'Payment required — not recorded as paid.',
      pending: 'Payment pending — not recorded as paid.',
      paid:
        payment.method === 'deposit'
          ? 'Deposit recorded as paid — check remaining balance.'
          : 'Payment recorded as paid.',
      failed: 'Payment failed — not recorded as paid.',
      cancelled: 'Payment cancelled — not recorded as paid.',
      refunded: 'Payment refunded.',
    }[payment.status] || 'Payment status unknown — check before settlement.'

  const method = payment.method
  const instruction =
    method && payment.status === 'not_required'
      ? method === 'room_charge'
        ? kitchenOrderPaymentMethodLabel(receipt.order_type, method)
        : ['pay_later', 'cash', 'card_at_pickup', 'card_to_driver'].includes(
              method
            )
          ? receipt.order_type === 'room_service'
            ? 'Pay later'
            : menuOrderPaymentLabel(receipt.order_type, 'pay_later')
          : ''
      : ''

  return [instruction, status].filter(Boolean)
}

export const renderKitchenOrderReceiptHtml = (
  receipt: CreatedMenuOrderReceipt
) => {
  const currency = /^[A-Z]{3}$/.test(receipt.currency)
    ? receipt.currency
    : 'CHF'
  const customerLines = [
    receipt.customer?.name,
    receipt.customer?.phone,
    receipt.customer?.address,
    receipt.customer?.allergy_note
      ? `Allergy: ${receipt.customer.allergy_note}`
      : '',
    receipt.customer?.notes ? `Notes: ${receipt.customer.notes}` : '',
  ].filter(Boolean)
  const isSimulation = receipt.customer?.name?.includes('LOCAL SIMULATION')
  const kitchenNotes = [
    isSimulation ? 'SIMULATION — DO NOT PREPARE' : '',
    receipt.customer?.allergy_note
      ? `ALLERGY: ${receipt.customer.allergy_note}`
      : '',
    isSimulation &&
    receipt.customer?.notes ===
      'No connected order. No physical printer. No payment or revenue.'
      ? ''
      : receipt.customer?.notes,
  ].filter(Boolean)
  const rows = (includePrices: boolean) =>
    receipt.items
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
        ${includePrices ? `<td class="money">${escapeHtml(money(item.total_chf, currency))}</td>` : ''}
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
      margin: 0;
      size: 80mm auto;
    }

    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      color: #000;
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
      width: 80mm;
      max-width: 100%;
      padding: 5mm;
      overflow-wrap: anywhere;
    }

    .kitchen {
      padding-top: 38.1mm;
      break-after: page;
      page-break-after: always;
      font-size: 14px;
    }

    .ticket-heading {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 3mm;
    }

    .order-number {
      font-size: 24px;
      font-weight: 900;
      text-align: right;
    }

    .kitchen small { font-size: 12px; }
    .kitchen .qty { font-size: 18px; width: 9mm; }
    .kitchen .service { margin-top: 6px; font-weight: 700; }

    @media screen {
      body { background: #eee; padding: 5mm; }
      .receipt { background: white; margin: 0 auto 5mm; }
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
      color: #000;
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

    .brand {
      padding-top: 12px;
      text-align: center;
    }

    .brand img {
      display: inline-block;
      width: 24mm;
      max-width: 100%;
      height: auto;
      filter: grayscale(1) brightness(0);
    }

    .total {
      margin-top: 6px;
      font-size: 14px;
      font-weight: 800;
    }

    .brand .logo {
      display: block;
      width: 12mm;
      margin: 0 auto 2mm;
      filter: grayscale(1);
    }
  </style>
</head>
<body>
  <article class="receipt kitchen" aria-label="Kitchen ticket">
    <header class="header">
      <div class="ticket-heading"><span></span><strong class="order-number">${escapeHtml(receipt.order_number)}</strong></div>
      <p class="service">${escapeHtml(orderTypeLabel(receipt.order_type))}${receipt.requested_for ? ` · ${escapeHtml(Number.isNaN(new Date(receipt.requested_for).getTime()) ? receipt.requested_for : new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit' }).format(new Date(receipt.requested_for)))}` : ''}</p>
    </header>
    ${kitchenNotes.map((line) => `<p class="section">${escapeHtml(line)}</p>`).join('')}
    <section class="section"><table><tbody>${rows(false)}</tbody></table></section>
  </article>
  <article class="receipt" aria-label="Detailed order ticket">
    <section class="header">
      <div class="ticket-heading"><h1>Order</h1><strong class="order-number">${escapeHtml(receipt.order_number)}</strong></div>
      <p class="meta">${escapeHtml(orderTypeLabel(receipt.order_type))} · ${escapeHtml(formatCreatedAt(receipt.created_at))}</p>
      ${
        receipt.requested_for
          ? `<p class="meta">${receipt.order_type === 'collection' ? 'Pickup' : 'Requested for'}: ${escapeHtml(formatCreatedAt(receipt.requested_for))} (${escapeHtml(Intl.DateTimeFormat().resolvedOptions().timeZone)})</p>`
          : ''
      }
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
        <tbody>${rows(true)}</tbody>
      </table>
    </section>

    <section class="section">
      ${receiptPaymentLines(receipt)
        .map((line) => `<p>${escapeHtml(line)}</p>`)
        .join('')}
    </section>

    <section class="totals">
      <p><span>Subtotal</span><span>${escapeHtml(money(receipt.subtotal_chf, currency))}</span></p>
      ${
        receipt.delivery_fee_chf
          ? `<p><span>Delivery</span><span>${escapeHtml(money(receipt.delivery_fee_chf, currency))}</span></p>`
          : ''
      }
      <p class="total"><span>Total</span><span>${escapeHtml(money(receipt.total_chf, currency))}</span></p>
    </section>
    <footer class="brand">
      <img class="logo" src="/img/ecosystem/logo.png" alt="" />
      <img src="/img/ecosystem/wordmark-light.png" alt="Ordering platform" />
    </footer>
  </article>
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

export function printKitchenOrderTicket(
  order: KitchenOrder,
  target?: Window | null
) {
  if (
    order.payment?.flow === 'confirmation_first' &&
    (!['accepted', 'ready', 'completed'].includes(order.status) ||
      !order.payment.method ||
      (order.payment.required && order.payment.status !== 'paid'))
  ) {
    target?.close()
    return false
  }
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

  return printReceipt(receipt, target)
}

/** Reserve during the operator gesture, before any asynchronous transition. */
export function openKitchenOrderPrintWindow(): Window | null {
  if (!import.meta.client) return null
  try {
    return window.open('', '_blank', 'width=420,height=720')
  } catch {
    return null
  }
}

function printReceipt(
  receipt: CreatedMenuOrderReceipt,
  reserved?: Window | null
) {
  if (!import.meta.client) return false
  const target =
    reserved === undefined ? openKitchenOrderPrintWindow() : reserved
  if (!target || target.closed) return false
  try {
    target.document.open()
    target.document.write(renderKitchenOrderReceiptHtml(receipt))
    target.document.close()
    // The browser was asked to print; physical printing is not observable here.
    return true
  } catch {
    target.close()
    return false
  }
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
