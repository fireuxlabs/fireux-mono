import { connectionPeer } from 'fireux-fireux/runtime/user/server/connections/handlers'
import { connectionBoundary } from 'fireux-core/runtime/user/server/connections/transport'
import { defineEventHandler } from 'h3'
export default defineEventHandler((event) =>
  connectionBoundary(() => connectionPeer(event))
)
