import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeaders } from 'h3'
import { readProjectEcosystems } from '../../../../../project/ecosystem/read'

export default defineLiveReadHandler(async (event) => {
  setResponseHeaders(event, { 'Cache-Control': 'private, no-store' })
  return readProjectEcosystems(event, getRouterParam(event, 'projectId'))
})
