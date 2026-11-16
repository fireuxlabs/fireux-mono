import { getRouterParam, setResponseHeaders } from 'h3'

import { defineLiveProjection } from 'fireux-core/runtime/server/utils/live-projection'
import { readProjectTeam } from 'fireux-projects/runtime/project/server/team/read'

export default defineLiveProjection({
  access: 'protected',
  read: async (event, sources) => {
    const response = await readProjectTeam(
      event,
      getRouterParam(event, 'projectId'),
      sources
    )
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    })
    return response
  },
})
