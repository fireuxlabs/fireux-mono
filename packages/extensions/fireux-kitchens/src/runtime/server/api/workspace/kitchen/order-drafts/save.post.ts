import { defineEventHandler, readBody } from 'h3'
import { saveKitchenOrderDraft } from '../../../../../kitchen/server/orders/save-draft'
export default defineEventHandler(async (event) =>
  saveKitchenOrderDraft(event, await readBody(event))
)
