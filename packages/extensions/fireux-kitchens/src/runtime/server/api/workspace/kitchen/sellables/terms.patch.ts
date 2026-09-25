import { defineEventHandler, readBody } from 'h3'
import { updateKitchenSellableTerms } from '../../../../../kitchen/server/sellables/commands'
export default defineEventHandler(async (event) =>
  updateKitchenSellableTerms(event, await readBody(event))
)
