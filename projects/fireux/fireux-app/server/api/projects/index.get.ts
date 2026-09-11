import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { setResponseHeaders, type H3Event } from 'h3'
import type { CollectionResponse } from 'fireux-core/runtime/models/utils/directory'
import type { Project } from 'fireux-core/runtime/project/models/project.model'
import { readProjects } from '../../project/index/directory'

export default defineLiveReadHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  })
  const items = await readProjects()
  return {
    ok: true,
    count: items.length,
    generatedAt: new Date().toISOString(),
    items,
  } satisfies CollectionResponse<Project>
})
