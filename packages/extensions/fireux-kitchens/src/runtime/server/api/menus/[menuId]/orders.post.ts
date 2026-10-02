import { defineEventHandler, getQuery, getRouterParam, readBody } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'
import { createMenuOrder } from '../../../../menu/server/ordering/create.ts'
import { text } from '../../../../menu/server/ordering/order-request.ts'
import type { CreateMenuOrderBody } from '../../../../menu/server/ordering/lines.ts'

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
    headers: ['content-type', 'authorization'],
  })
  return createMenuOrder(event, {
    menuId: text(getRouterParam(event, 'menuId')),
    kitchenSlug: text(getQuery(event).kitchenSlug),
    body: (await readBody(event)) as CreateMenuOrderBody | null,
  })
})
