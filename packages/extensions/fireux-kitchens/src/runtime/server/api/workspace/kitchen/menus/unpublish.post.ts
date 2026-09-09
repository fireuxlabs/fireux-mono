import { defineEventHandler, readBody } from 'h3'
import { unpublishKitchenMenu } from '../../../../../menu/server/workspace-commands'
export default defineEventHandler(async (event) =>
  unpublishKitchenMenu(event, await readBody(event))
)
