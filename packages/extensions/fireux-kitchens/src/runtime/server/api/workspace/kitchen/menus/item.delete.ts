import { defineEventHandler, readBody } from 'h3'
import { removeKitchenMenuItem } from '../../../../../menu/server/items/remove'
export default defineEventHandler(async (event) =>
  removeKitchenMenuItem(event, await readBody(event))
)
