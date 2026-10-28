import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'
import type { ProjectPublicSummary } from 'fireux-fireux/runtime/project/models/project.model'
import { readProjectDetail } from 'fireux-fireux/runtime/project/server/index/detail'

export default defineEventHandler(async (event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  const item = await readProjectDetail(getRouterParam(event, 'id'))
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    item,
  } satisfies DetailResponse<ProjectPublicSummary>
})
