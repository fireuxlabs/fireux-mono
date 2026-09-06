import { createHash } from 'node:crypto'
import { defineEventHandler, setResponseHeader } from 'h3'
import { readPlatformContext } from 'fireux-core/runtime/utils/platform-context'

export default defineEventHandler((event) => {
  const context = readPlatformContext()
  setResponseHeader(event, 'cache-control', 'public, max-age=300')
  return {
    schemaVersion: 1,
    visibility: 'public',
    contextId: 'platform',
    sourcePath: '/api/fireux/context/platform',
    revision: createHash('sha256')
      .update(JSON.stringify(context))
      .digest('hex'),
    context,
  }
})
