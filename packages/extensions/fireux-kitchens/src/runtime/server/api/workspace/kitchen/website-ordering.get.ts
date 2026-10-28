import { defineEventHandler, setResponseHeader, getQuery } from 'h3'

import { readWorkspaceKitchenAllowedWebsites } from '../../../../kitchen/server/integrations/website-ordering'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return readWorkspaceKitchenAllowedWebsites(event, getQuery(event).kitchenId)
})
