import { defineEventHandler, readBody } from 'h3'
import { updateKitchenServiceInteraction } from '../../../../../kitchen/server/services/commands'
export default defineEventHandler(async (event) =>
  updateKitchenServiceInteraction(event, await readBody(event))
)
