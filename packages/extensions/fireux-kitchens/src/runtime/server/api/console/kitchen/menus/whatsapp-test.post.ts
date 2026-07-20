// Concurrent edit — 2026-07-19 22:12 CEST — Pre-order WhatsApp test pass: let an authenticated Kitchen operator verify the stored recipient and provider.
import {
  createError,
  defineEventHandler,
  readBody,
  type H3Event,
} from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { requireKitchenOperator } from '../../../../kitchen/operator-access.ts'
import { readMenuOrderingConfig } from '../../../../menu/ordering/config.ts'
import {
  menuPreOrderWhatsAppErrorMessage,
  sendPreOrderWhatsAppTest,
} from '../../../../menu/ordering/whatsapp.ts'

type WhatsAppTestBody = {
  appId?: string
  kitchenId?: string
  menuId?: string
}

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as WhatsAppTestBody | null
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const menuId = requirePathSegment(body?.menuId, 'Menu id')

  await requireKitchenOperator(event, { appId, kitchenId })

  const db = getRuntimeFirestore()
  const menuSnap = await db
    .doc(`apps/${appId}/kitchens/${kitchenId}/menus/${menuId}`)
    .get()
  if (!menuSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const preOrder = readMenuOrderingConfig(record(menuSnap.data()))
    .order_types
    .find(config => config.type === 'pre_order')
  const whatsapp = preOrder?.notifications?.whatsapp
  if (!whatsapp?.enabled || !whatsapp.recipient_phone) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Enable the Pre-order WhatsApp recipient before testing.',
    })
  }

  try {
    const providerMessageId = await sendPreOrderWhatsAppTest(
      whatsapp.recipient_phone
    )

    return {
      ok: true,
      provider_message_id: providerMessageId,
    }
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: menuPreOrderWhatsAppErrorMessage(error),
    })
  }
})
