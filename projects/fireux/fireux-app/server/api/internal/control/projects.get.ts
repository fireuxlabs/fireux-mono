import { defineEventHandler, setResponseHeaders } from 'h3'
import { readProjectIndex } from '../../../project/index/read'

export default defineEventHandler(async (event) => {
  const response = await readProjectIndex(event)
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return response
})
