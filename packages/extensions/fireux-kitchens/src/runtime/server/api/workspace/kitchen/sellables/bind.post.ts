import { defineEventHandler, readBody } from 'h3'
import { bindKitchenMenuSellable } from '../../../../../kitchen/server/sellables/bind'
export default defineEventHandler(async (event) =>
  bindKitchenMenuSellable(event, await readBody(event))
)
