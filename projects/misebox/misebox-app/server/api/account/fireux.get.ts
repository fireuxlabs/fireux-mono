import { defineEventHandler } from 'h3'
import { connectionBoundary } from 'fireux-core/runtime/user/server/connections/transport'
import { inspectFireuxConnection } from '../../user/connections/fireux'
export default defineEventHandler((event) =>
  connectionBoundary(() => inspectFireuxConnection(event))
)
