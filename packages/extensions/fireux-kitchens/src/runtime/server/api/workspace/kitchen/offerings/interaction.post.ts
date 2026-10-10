import { defineEventHandler, readBody } from 'h3'
import { updateKitchenOfferingInteraction } from '../../../../../kitchen/server/offerings/update-interaction'
export default defineEventHandler(async (event) =>
  updateKitchenOfferingInteraction(event, await readBody(event))
)
