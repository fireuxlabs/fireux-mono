import { defineEventHandler, readBody } from 'h3'
import { updateKitchenSellableTerms } from '../../../../../kitchen/server/sellables/update-terms'
export default defineEventHandler(async (event) =>
  updateKitchenSellableTerms(event, await readBody(event))
)
