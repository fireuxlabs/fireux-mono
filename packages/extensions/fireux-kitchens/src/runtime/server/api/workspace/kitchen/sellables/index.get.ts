import { getQuery } from 'h3'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { readWorkspaceKitchenSellable } from '../../../../../kitchen/server/sellables/read'
export default defineLiveReadHandler((event) =>
  readWorkspaceKitchenSellable(event, getQuery(event))
)
