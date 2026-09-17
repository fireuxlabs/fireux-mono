import { defineEventHandler, readBody } from 'h3'
import { updateKitchenOperationHours } from '../../../../../kitchen/server/ordering/hours'

export default defineEventHandler(async (event) =>
  updateKitchenOperationHours(event, await readBody(event))
)
