import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeaders } from 'h3'
import { readProjectApps } from '../../../../../project/apps/read'

export default defineLiveReadHandler(async (event) => {
  setResponseHeaders(event, { 'Cache-Control': 'private, no-store' })
  return readProjectApps(event, getRouterParam(event, 'projectId'))
})
