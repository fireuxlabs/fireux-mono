import { defineEventHandler, readBody } from 'h3'
import { updateKitchenService } from '../../../../../kitchen/server/services/commands'
export default defineEventHandler(async (event) =>
  updateKitchenService(event, await readBody(event))
)
