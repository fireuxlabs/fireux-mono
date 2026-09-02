import { defineEventHandler, getRouterParam, readBody, setResponseHeaders } from 'h3'
import { updateProjectTest } from '../../../../../../project/test/update'

export default defineEventHandler(async (event) => {
  const response = await updateProjectTest(
    event,
    getRouterParam(event, 'projectId'),
    getRouterParam(event, 'testId'),
    await readBody(event)
  )
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
