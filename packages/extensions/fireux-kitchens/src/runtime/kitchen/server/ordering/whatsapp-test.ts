import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenOperator } from '../core/operator-access.ts'
import { readKitchenServices } from '../../utils/kitchen-services'
import {
  preOrderWhatsAppErrorMessage,
  sendPreOrderWhatsAppTest,
} from './whatsapp.ts'

const record = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}

export async function testKitchenOrderingWhatsApp(
  event: H3Event,
  input: unknown
) {
  const body = record(input)
  const appId = requirePathSegment(body?.appId, 'App id')
  const kitchenId = requirePathSegment(body?.kitchenId, 'Kitchen id')
  const serviceId = requirePathSegment(body?.serviceId, 'Service id')

  await requireKitchenOperator(event, { appId, kitchenId })

  const db = getRuntimeFirestore()
  const kitchenSnap = await db.doc(`kitchens/${kitchenId}`).get()
  if (!kitchenSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  const service = readKitchenServices(record(kitchenSnap.data()).services).find(
    (row) => row.id === serviceId
  )
  if (!service)
    throw createError({ statusCode: 404, statusMessage: 'Service not found.' })
  const preOrder = service.interactions.find(
    (config) => config.type === 'pre_order'
  )
  const whatsapp =
    preOrder?.type === 'pre_order'
      ? preOrder.notifications?.whatsapp
      : undefined
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
      statusMessage: preOrderWhatsAppErrorMessage(error),
    })
  }
}
