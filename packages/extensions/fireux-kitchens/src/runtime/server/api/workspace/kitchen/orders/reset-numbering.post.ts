import { defineEventHandler, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenOperator } from '../../../../../kitchen/server/core/operator-access.ts'
import { resetKitchenOrderNumbering } from '../../../../../kitchen/server/orders/order-numbering.ts'

type ResetKitchenOrderNumberingBody = {
  app_id?: string
  kitchen_id?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as ResetKitchenOrderNumberingBody | null
  const appId = requirePathSegment(body?.app_id, 'App id')
  const kitchenId = requirePathSegment(body?.kitchen_id, 'Kitchen id')
  const actorId = await requireKitchenOperator(event, { appId, kitchenId })
  const numbering = await resetKitchenOrderNumbering({
    actorId,
    appId,
    kitchenId,
  })

  return { ok: true, app_id: appId, kitchen_id: kitchenId, numbering }
})
