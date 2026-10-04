import { defineEventHandler } from 'h3'
import { connectionBoundary } from 'fireux-core/runtime/user/server/connections/transport'
import { fireuxConnectionCommand } from '../../user/connections/fireux'
export default defineEventHandler((event) =>
  connectionBoundary(() => fireuxConnectionCommand(event))
)
