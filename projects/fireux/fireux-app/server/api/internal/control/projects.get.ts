import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { getQuery, setResponseHeaders } from 'h3'
import { readProjectIndex } from '../../../project/index/read'

export default defineLiveReadHandler(async (event) => {
  const response = await readProjectIndex(
    event,
    String(getQuery(event).project_id || '').trim()
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
