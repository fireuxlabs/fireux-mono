import {
  defineEventHandler,
  setResponseHeader,
  getRouterParam,
  setResponseHeaders,
} from 'h3'

import { readProjectEcosystems } from '../../../../../project/ecosystem/read'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, { 'Cache-Control': 'no-store' })
  return readProjectEcosystems(event, getRouterParam(event, 'projectId'))
})
