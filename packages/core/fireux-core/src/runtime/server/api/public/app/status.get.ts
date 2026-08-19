import { defineEventHandler, setResponseHeaders } from 'h3'
import { readAppStatus } from '../../../../app/server/index/status'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return readAppStatus(event)
})
