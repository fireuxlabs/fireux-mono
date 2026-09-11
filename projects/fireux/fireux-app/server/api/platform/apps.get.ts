import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery, setResponseHeaders, type H3Event } from 'h3'
import { readPlatformAppCollection } from '../../utils/apps'

export default defineLiveReadHandler(async (event: H3Event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return readPlatformAppCollection(getQuery(event))
})
