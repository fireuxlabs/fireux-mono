import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import { readProjectApps } from '../../../../../project/apps/read'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, { 'Cache-Control': 'no-store' })
  return readProjectApps(event, getRouterParam(event, 'projectId'))
})
