import { defineEventHandler, readBody } from 'h3'
import { createKitchenOffering } from '../../../../../kitchen/server/offerings/create'
export default defineEventHandler(async (event) =>
  createKitchenOffering(event, await readBody(event))
)
