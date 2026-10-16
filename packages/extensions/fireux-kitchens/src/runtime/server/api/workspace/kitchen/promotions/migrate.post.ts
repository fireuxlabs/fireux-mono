import { defineEventHandler, readBody } from 'h3'
import { saveKitchenPromotion } from '../../../../../kitchen/server/promotions/write'
export default defineEventHandler(async (event) =>
  saveKitchenPromotion(event, await readBody(event), true)
)
