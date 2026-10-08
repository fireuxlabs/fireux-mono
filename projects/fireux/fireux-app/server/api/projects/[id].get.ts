import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeaders, type H3Event } from 'h3'
import type { DetailResponse } from 'fireux-core/runtime/models/utils/directory'
import type { ProjectPublicSummary } from 'fireux-fireux/runtime/project/models/project.model'
import { readProjectDetail } from 'fireux-fireux/runtime/project/server/index/detail'

export default defineLiveReadHandler(async (event: H3Event) => {
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
