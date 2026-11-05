import {
  defineEventHandler,
  setResponseHeader,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'

import { readBusinessDirectoryPage } from '../../../business/server/business/directory'

export default defineEventHandler((event: H3Event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return readBusinessDirectoryPage(getQuery(event))
})
