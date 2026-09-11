import { defineLiveReadHandler } from 'fireux-core/runtime/server/utils/http/defineLiveReadHandler'
import { setResponseHeaders } from 'h3'
import { readAppStatus } from '../../../app/server/index/status'

export default defineLiveReadHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return readAppStatus(event)
})
