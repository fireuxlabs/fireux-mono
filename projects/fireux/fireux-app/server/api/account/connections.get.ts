import { defineEventHandler, setResponseHeader } from 'h3'
import { listConnections } from 'fireux-fireux/runtime/user/server/connections/handlers'
import { connectionBoundary } from 'fireux-core/runtime/user/server/connections/transport'

export default defineEventHandler((event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  return connectionBoundary(() => listConnections(event))
})
