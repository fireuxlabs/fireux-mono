import { defineEventHandler, readBody, setResponseHeaders } from 'h3'
import { createProject } from 'fireux-fireux/runtime/project/server/index/create'

export default defineEventHandler(async (event) => {
  const response = await createProject(event, await readBody(event))
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
