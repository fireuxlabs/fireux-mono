import { defineEventHandler, readBody } from 'h3'
import { updateKitchenOffering } from '../../../../../kitchen/server/offerings/commands'
export default defineEventHandler(async (event) =>
  updateKitchenOffering(event, await readBody(event))
)
