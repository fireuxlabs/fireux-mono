import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { readProjectTests } from '../../../../../project/test/read'

export default defineEventHandler(async (event) => {
  const response = await readProjectTests(event, getRouterParam(event, 'projectId'))
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
