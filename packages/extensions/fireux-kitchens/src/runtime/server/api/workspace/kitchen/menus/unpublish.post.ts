import { defineEventHandler, readBody } from 'h3'
import { withdrawKitchenMenu } from '../../../../../menu/server/publication/withdraw'
export default defineEventHandler(async (event) =>
  withdrawKitchenMenu(event, await readBody(event), 'draft')
)
