import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readProjectApps } from '../../../../../project/apps/read'

export default defineEventHandler(async event => {
  setResponseHeaders(event, { 'Cache-Control': 'private, no-store' })
  return readProjectApps(event, getRouterParam(event, 'projectId'))
})
