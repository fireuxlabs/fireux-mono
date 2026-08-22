import { defineEventHandler, readBody } from 'h3'
import { updateKitchenFulfilment } from '../../../../kitchen/server/core/fulfilment-update.ts'

export default defineEventHandler(async (event) =>
  updateKitchenFulfilment(event, await readBody(event))
)
