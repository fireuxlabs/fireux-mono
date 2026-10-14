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
  if (
    body.kitchenId !== target.kitchenId ||
    !['collection', 'delivery', 'on_site'].includes(body.order?.fulfilment) ||
    body.order?.channel !== 'website'
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Use the website ordering channel.',
    })
  const selections = readMenuOrderSelections(body.selections)
  return submitKitchenOrderRequest(
    event,
    { kitchenId: target.kitchenId, order: body.order },
    { target, selections, expectedTotal: body.expectedTotal }
  )
})
