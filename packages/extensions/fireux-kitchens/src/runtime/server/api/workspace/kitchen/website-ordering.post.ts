import { defineEventHandler, readBody } from 'h3'
import { updateKitchenAllowedWebsites } from '../../../../kitchen/server/integrations/website-ordering'
export default defineEventHandler(async (event) =>
  updateKitchenAllowedWebsites(event, await readBody(event))
)
