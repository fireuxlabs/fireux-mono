import { defineEventHandler, readBody } from 'h3'
import { updateKitchenOrderIntake } from '../../../../../kitchen/server/ordering/intake'
export default defineEventHandler(async (event) =>
  updateKitchenOrderIntake(event, await readBody(event))
)
