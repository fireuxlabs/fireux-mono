import { defineEventHandler, readBody, createError } from 'h3'
import { resolveMenuTarget } from '../../../menu/server/ownership/target'
import { readMenuOrderSelections } from '../../../menu/server/ordering'
import { submitKitchenOrderRequest } from '../../../kitchen/server/orders/submit-request'
export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (
    !body ||
    typeof body !== 'object' ||
    Object.keys(body).some(
      (key) =>
        ![
          'kitchenId',
          'menuId',
          'kitchenSlug',
          'selections',
          'order',
          'expectedTotal',
        ].includes(key)
    ) ||
    typeof body.expectedTotal !== 'number' ||
    !Number.isFinite(body.expectedTotal) ||
    body.expectedTotal < 0
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu order is invalid.',
    })
  const target = await resolveMenuTarget(body.menuId, body.kitchenSlug)
  const channel = body.order?.channel
  const fulfilments =
    channel === 'kiosk'
      ? ['on_site', 'takeaway']
      : channel === 'website'
        ? ['collection', 'delivery', 'on_site']
        : []
  if (
    body.kitchenId !== target.kitchenId ||
    !fulfilments.includes(body.order?.fulfilment)
  )
    throw createError({
      statusCode: 400,
      statusMessage:
        'Choose a supported customer ordering channel and fulfilment.',
    })
  const selections = readMenuOrderSelections(body.selections)
  return submitKitchenOrderRequest(
    event,
    { kitchenId: target.kitchenId, order: body.order },
    { target, selections, expectedTotal: body.expectedTotal }
  )
})
