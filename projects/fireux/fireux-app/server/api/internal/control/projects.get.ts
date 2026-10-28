import {
  defineEventHandler,
  setResponseHeader,
  getQuery,
  setResponseHeaders,
} from 'h3'

import { readProjectIndex } from 'fireux-fireux/runtime/project/server/index/read'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  const response = await readProjectIndex(
    event,
    String(getQuery(event).project_id || '').trim()
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return response
})
