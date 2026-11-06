import {
  defineEventHandler,
  setResponseHeader,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import type { CollectionResponse } from 'fireux-core/runtime/models/utils/directory'
import type { ProjectPublicSummary } from 'fireux-projects/runtime/project/models/project.model'
import { readProjects } from 'fireux-projects/runtime/project/server/directory/read'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  const items = await readProjects()
  return {
    ok: true,
    count: items.length,
    generatedAt: new Date().toISOString(),
    items,
  } satisfies CollectionResponse<ProjectPublicSummary>
})
