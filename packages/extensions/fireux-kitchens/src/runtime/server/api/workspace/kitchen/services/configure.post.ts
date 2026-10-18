import { defineEventHandler, readBody } from 'h3'
import { configureKitchenOffering } from '../../../../../kitchen/server/offerings/configure'
export default defineEventHandler(async (event) =>
  configureKitchenOffering(event, await readBody(event))
)
