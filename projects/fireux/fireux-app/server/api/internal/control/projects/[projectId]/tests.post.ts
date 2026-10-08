import {
  defineEventHandler,
  getRouterParam,
  readBody,
  setResponseHeaders,
} from 'h3'
import { createProjectTest } from 'fireux-fireux/runtime/project/server/test/create'

export default defineEventHandler(async (event) => {
  const response = await createProjectTest(
    event,
    getRouterParam(event, 'projectId'),
    await readBody(event)
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
