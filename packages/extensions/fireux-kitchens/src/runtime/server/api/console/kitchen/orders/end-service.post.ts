import { defineEventHandler, readBody, type H3Event } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { requireKitchenOperator } from '../../../../../server/kitchen/core/operator-access.ts'
import { endKitchenOrderService } from '../../../../../server/kitchen/operations/orders/service-sequence.ts'

type EndKitchenOrderServiceBody = {
  app_id?: string
  kitchen_id?: string
}

export default defineEventHandler(async (event: H3Event) => {
  const body = (await readBody(event)) as EndKitchenOrderServiceBody | null
  const appId = requirePathSegment(body?.app_id, 'App id')
  const kitchenId = requirePathSegment(body?.kitchen_id, 'Kitchen id')
  const actorId = await requireKitchenOperator(event, { appId, kitchenId })
  const service = await endKitchenOrderService({
    actorId,
    appId,
    kitchenId,
  })

  return { ok: true, service }
})
