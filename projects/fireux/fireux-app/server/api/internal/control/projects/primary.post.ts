import { defineEventHandler, readBody, setResponseHeaders } from 'h3'
import { setPrimaryProject } from '../../../../project/index/primary'

export default defineEventHandler(async (event) => {
  const response = await setPrimaryProject(event, await readBody(event))
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
