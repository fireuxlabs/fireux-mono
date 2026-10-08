import { defineEventHandler, getQuery, getRouterParam, readBody } from 'h3'
import { requirePathSegment } from 'fireux-core/runtime/server/utils/ids/path'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import { executeMenuOrderPaymentChoice } from '../../../../../../menu/server/ordering/payment-choice-command'
import { MENU_ORDER_CAPABILITY_HEADER } from '../../../../../../menu/utils/menu-order-capability'

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
    headers: ['content-type', 'authorization', MENU_ORDER_CAPABILITY_HEADER],
  })
  const menuId = requirePathSegment(getRouterParam(event, 'menuId'), 'Menu id')
  const orderId = requirePathSegment(
    getRouterParam(event, 'orderId'),
    'Order id'
  )
  const body = await readBody<{ method?: unknown } | null>(event)
  return executeMenuOrderPaymentChoice(event, {
    menuId,
    orderId,
    kitchenSlug: String(getQuery(event).kitchenSlug || ''),
    method: body?.method,
  })
})
