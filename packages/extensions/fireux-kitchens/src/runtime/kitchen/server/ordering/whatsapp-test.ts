import { createError, type H3Event } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenOperator } from '../core/operator-access.ts'
import { readKitchenOfferings } from '../offerings/read'
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
  const offeringId = requirePathSegment(body?.offeringId, 'Offering id')

  await requireKitchenOperator(event, { appId, kitchenId })

  const db = getRuntimeFirestore()
  const kitchenSnap = await db.doc(`kitchens/${kitchenId}`).get()
  if (!kitchenSnap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Kitchen not found.',
    })
  }

  const offerings = await readKitchenOfferings(db, kitchenId).catch(() => {
    throw createError({ statusCode: 503, statusMessage: 'Kitchen offerings could not be read.' })
  })
  const offering = offerings.find(
    (row) => row.id === offeringId
  )
  if (!offering)
    throw createError({ statusCode: 404, statusMessage: 'Offering not found.' })
  const preOrder = offering.interactions.find(
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
      app_id: appId,
      kitchen_id: kitchenId,
      kitchen_offering_id: offeringId,
      provider_message_id: providerMessageId,
    }
  } catch (error) {
    throw createError({
      statusCode: 502,
      statusMessage: preOrderWhatsAppErrorMessage(error),
    })
  }
}
