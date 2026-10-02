import { defineEventHandler, readBody } from 'h3'
import { executeKitchenOrderAction } from '../../../../../kitchen/server/orders/actions.ts'

export default defineEventHandler(async (event) =>
  executeKitchenOrderAction(event, await readBody(event))
)
