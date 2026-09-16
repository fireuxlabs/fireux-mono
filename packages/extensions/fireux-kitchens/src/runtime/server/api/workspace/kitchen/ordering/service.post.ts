import { defineEventHandler, readBody } from 'h3'
import { updateKitchenOrderingService } from '../../../../../kitchen/server/ordering/update'
export default defineEventHandler(async (event) =>
  updateKitchenOrderingService(event, await readBody(event))
)
