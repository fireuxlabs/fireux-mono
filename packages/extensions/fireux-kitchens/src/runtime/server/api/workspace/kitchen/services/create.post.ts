import { defineEventHandler, readBody } from 'h3'
import { createKitchenService } from '../../../../../kitchen/server/services/commands'
export default defineEventHandler(async (event) =>
  createKitchenService(event, await readBody(event))
)
