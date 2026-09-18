import { defineEventHandler, readBody } from 'h3'
import { configureKitchenService } from '../../../../../kitchen/server/services/configure'
export default defineEventHandler(async (event) =>
  configureKitchenService(event, await readBody(event))
)
