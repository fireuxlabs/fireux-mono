import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery } from 'h3'
import { readWorkspaceKitchenAllowedWebsites } from '../../../../kitchen/server/integrations/website-ordering'

export default defineLiveReadHandler((event) =>
  readWorkspaceKitchenAllowedWebsites(event, getQuery(event).kitchenId)
)
