// Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: share provider delivery with an authenticated workspace test.
// Concurrent edit — 2026-07-20 15:19 CEST — Pre-order WhatsApp workspace-link pass: require the global confirmation route in every provider template.
import { Timestamp, type DocumentData } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverKitchenOrdersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { normalizeMenuOrderWhatsAppPhone } from '../../utils/menu-order-whatsapp.ts'

type DispatchPreOrderWhatsAppInput = {
  appId: string
  kitchenId: string
  orderId: string
}

type ClaimedPreOrderWhatsApp = {
  attempt: number
  order: DocumentData
  recipientPhone: string
}

type WhatsAppProviderConfig = {
  accessToken: string
  workspaceUrl: string
  graphVersion: string
  languageCode: string
  phoneNumberId: string
  templateName: string
}

const deliveryLeaseMs = 60_000
const preOrderWorkspacePath = '/workspace/kitchen/orders/pre-orders'
const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
const numberValue = (value: unknown) => {
  const number = Number(value)

  return Number.isFinite(number) ? number : 0
}
const safeSegment = (value: string) =>
  Boolean(value && !value.includes('/') && value !== '.' && value !== '..')

export async function dispatchPreOrderWhatsApp(
  input: DispatchPreOrderWhatsAppInput
) {
  if (![input.appId, input.kitchenId, input.orderId].every(safeSegment)) {
    return { state: 'skipped' as const }
  }

  const orders = serverKitchenOrdersTarget(input.kitchenId)
  const claim = await claimDelivery(orders, input.orderId)
  if (!claim) return { state: 'skipped' as const }

  try {
    const providerMessageId = await sendTemplate(claim)
    await finishDelivery(orders, input.orderId, claim.attempt, {
      state: 'sent',
      provider_message_id: providerMessageId,
    })
    return { state: 'sent' as const, providerMessageId }
  } catch (error) {
    const message = menuPreOrderWhatsAppErrorMessage(error)
    await finishDelivery(orders, input.orderId, claim.attempt, {
      state: 'failed',
      error: message,
    })
    console.warn('[fireux-kitchens] Pre-order WhatsApp alert failed', {
      orderId: input.orderId,
      error: message,
    })
    return { state: 'failed' as const }
  }
}

export async function sendPreOrderWhatsAppTest(recipientValue: unknown) {
  const recipientPhone = normalizeMenuOrderWhatsAppPhone(recipientValue)
  if (!recipientPhone) throw new Error('The WhatsApp recipient is invalid.')

  return sendTemplateMessage(recipientPhone, [
    'TEST',
    requestedTimeLabel(new Date().toISOString()),
    'Kitchen test',
    'Pre-order WhatsApp connection check',
    new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(0),
  ])
}

async function claimDelivery(
  orders: ReturnType<typeof serverKitchenOrdersTarget>,
  orderId: string
): Promise<ClaimedPreOrderWhatsApp | null> {
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const snapshot = await mutations.read(orders, orderId)
    if (!snapshot.exists) return null

    const order = snapshot.data || {}
    if (text(order.order_type) !== 'pre_order') return null
    if (text(order.status) === 'pending_payment') return null
    if (['cancelled', 'completed', 'trashed'].includes(text(order.status)))
      return null

    const notifications = record(order.notifications)
    const current = record(notifications.whatsapp)
    const recipientPhone = normalizeMenuOrderWhatsAppPhone(
      current.recipient_phone
    )
    if (!recipientPhone || text(current.state) === 'sent') return null

    const leaseUntil = timestampMillis(current.lease_until)
    if (text(current.state) === 'sending' && leaseUntil > Date.now())
      return null

    const attempt = Math.max(0, Math.floor(numberValue(current.attempts))) + 1
    const now = Timestamp.now()
    mutations.update(orders, orderId, {
      'notifications.whatsapp': {
        ...current,
        recipient_phone: recipientPhone,
        state: 'sending',
        attempts: attempt,
        lease_until: Timestamp.fromMillis(now.toMillis() + deliveryLeaseMs),
        updated_at: now,
      },
    })

    return { attempt, order, recipientPhone }
  })
}

async function finishDelivery(
  orders: ReturnType<typeof serverKitchenOrdersTarget>,
  orderId: string,
  attempt: number,
  result: Record<string, unknown>
) {
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const snapshot = await mutations.read(orders, orderId)
    if (!snapshot.exists) return

    const order = snapshot.data || {}
    const current = record(record(order.notifications).whatsapp)
    if (
      text(current.state) !== 'sending' ||
      Math.floor(numberValue(current.attempts)) !== attempt
    )
      return

    mutations.update(orders, orderId, {
      'notifications.whatsapp': {
        ...current,
        ...result,
        lease_until: null,
        updated_at: Timestamp.now(),
      },
    })
  })
}

async function sendTemplate(claim: ClaimedPreOrderWhatsApp) {
  return sendTemplateMessage(
    claim.recipientPhone,
    templateParameters(claim.order)
  )
}

async function sendTemplateMessage(
  recipientPhone: string,
  parameters: string[]
) {
  const config = providerConfig()
  const response = await fetch(
    `https://graph.facebook.com/${config.graphVersion}/${config.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: recipientPhone.slice(1),
        type: 'template',
        template: {
          name: config.templateName,
          language: { code: config.languageCode },
          components: [
            {
              type: 'body',
              parameters: [...parameters, config.workspaceUrl].map((value) => ({
                type: 'text',
                text: value,
              })),
            },
          ],
        },
      }),
      signal: AbortSignal.timeout(10_000),
    }
  )
  const body = (await response.json().catch(() => ({}))) as Record<
    string,
    unknown
  >
  if (!response.ok) {
    const providerError = record(body.error)
    throw new Error(
      text(providerError.message) ||
        `WhatsApp returned HTTP ${response.status}.`
    )
  }

  const firstMessage = Array.isArray(body.messages)
    ? record(body.messages[0])
    : {}
  const messageId = text(firstMessage.id)
  if (!messageId) throw new Error('WhatsApp did not return a message id.')

  return messageId
}

function providerConfig(): WhatsAppProviderConfig {
  const config = {
    accessToken: text(process.env.FIREUX_WHATSAPP_CLOUD_ACCESS_TOKEN),
    workspaceUrl: normalizePreOrderWorkspaceUrl(
      process.env.FIREUX_WHATSAPP_PRE_ORDER_CONSOLE_URL
    ),
    graphVersion: text(process.env.FIREUX_WHATSAPP_CLOUD_GRAPH_VERSION),
    languageCode: text(process.env.FIREUX_WHATSAPP_PRE_ORDER_TEMPLATE_LANGUAGE),
    phoneNumberId: text(process.env.FIREUX_WHATSAPP_CLOUD_PHONE_NUMBER_ID),
    templateName: text(process.env.FIREUX_WHATSAPP_PRE_ORDER_TEMPLATE),
  }
  if (
    !config.accessToken ||
    !config.workspaceUrl ||
    !/^v\d+\.\d+$/.test(config.graphVersion) ||
    !/^[A-Za-z0-9_]+$/.test(config.languageCode) ||
    !/^\d+$/.test(config.phoneNumberId) ||
    !/^[a-z0-9_]+$/.test(config.templateName)
  ) {
    throw new Error('WhatsApp provider is not configured.')
  }

  return config
}

function normalizePreOrderWorkspaceUrl(value: unknown) {
  const source = text(value)
  if (!source) return ''

  try {
    const url = new URL(source)
    const pathname = url.pathname.replace(/\/+$/, '') || '/'
    if (
      url.protocol !== 'https:' ||
      !url.hostname ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      pathname !== preOrderWorkspacePath
    )
      return ''

    url.pathname = preOrderWorkspacePath
    return url.toString()
  } catch {
    return ''
  }
}

function templateParameters(order: DocumentData) {
  const customer = record(order.customer)
  const items = Array.isArray(order.items) ? order.items : []
  const payment = record(order.payment)
  const currency = text(payment.currency_code).toUpperCase()
  if (!/^[A-Z]{3}$/.test(currency)) {
    throw new Error('Order currency is unavailable for WhatsApp delivery.')
  }
  const total = items.reduce((sum, value) => {
    const item = record(value)
    return (
      sum +
      numberValue(item.unit_price) * Math.max(1, numberValue(item.quantity))
    )
  }, 0)
  const itemSummary = items
    .map((value) => {
      const item = record(value)
      return `${Math.max(1, Math.floor(numberValue(item.quantity)))}× ${text(item.name) || text(item.label) || 'Item'}`
    })
    .join(', ')

  return [
    text(order.order_number) || text(order.id),
    requestedTimeLabel(order.requested_for),
    text(customer.name) || 'Guest',
    limitText(itemSummary || 'Order items', 900),
    new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency,
    }).format(total),
  ].map((value) => limitText(value, 1024))
}

function requestedTimeLabel(value: unknown) {
  const source = text(value)
  const match = source.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!match) return source || 'Requested time'

  return `${match[3]}.${match[2]}.${match[1]} ${match[4]}:${match[5]}`
}

function timestampMillis(value: unknown) {
  const source =
    value && typeof value === 'object'
      ? (value as { toMillis?: () => number; seconds?: number })
      : {}
  if (typeof source.toMillis === 'function') return source.toMillis()

  return numberValue(source.seconds) * 1000
}

function limitText(value: string, maximum: number) {
  return value.length <= maximum ? value : `${value.slice(0, maximum - 1)}…`
}

export function menuPreOrderWhatsAppErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : 'WhatsApp delivery failed.'

  return limitText(message.replace(/[\r\n]+/g, ' ').trim(), 240)
}
