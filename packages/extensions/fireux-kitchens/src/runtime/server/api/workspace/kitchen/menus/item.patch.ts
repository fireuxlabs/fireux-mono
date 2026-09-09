import { defineEventHandler, readBody } from 'h3'
import { updateKitchenMenuItem } from '../../../../../menu/server/workspace-commands'
export default defineEventHandler(async (event) =>
  updateKitchenMenuItem(event, await readBody(event))
)
