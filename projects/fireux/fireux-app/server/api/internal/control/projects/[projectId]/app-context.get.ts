import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getRouterParam, setResponseHeader } from 'h3'
import { readProjectAppContext } from '../../../../../project/index/app-context'
export default defineLiveReadHandler((event) => {
  setResponseHeader(event, 'cache-control', 'no-store')
  return readProjectAppContext(event, getRouterParam(event, 'projectId'))
})
