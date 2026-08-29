import { defineEventHandler, setResponseHeaders } from 'h3'
import { readPropertyWorkspacePrimary } from '../../../workspace/primary'

export default defineEventHandler(async (event) => {
  const response = await readPropertyWorkspacePrimary(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
