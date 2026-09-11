import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeaders } from 'h3'
import { readProjectTeam } from '../../../../../project/team/read'

export default defineLiveReadHandler(async (event) => {
  const response = await readProjectTeam(
    event,
    getRouterParam(event, 'projectId')
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
