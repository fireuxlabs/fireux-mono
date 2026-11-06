import { defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { deleteProjectTest } from 'fireux-projects/runtime/project/server/test/delete'

export default defineEventHandler(async (event) => {
  const response = await deleteProjectTest(
    event,
    getRouterParam(event, 'projectId'),
    getRouterParam(event, 'testId')
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
