import { listConnections } from 'fireux-fireux/runtime/user/server/connections/handlers'
import { connectionBoundary } from 'fireux-core/runtime/user/server/connections/transport'
import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
export default defineLiveReadHandler((event) =>
  connectionBoundary(() => listConnections(event))
)
