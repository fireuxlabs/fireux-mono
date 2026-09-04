import { defineEventHandler, setResponseHeaders } from 'h3'
import { readAppUsers } from '../../../../app/server/app-users/read'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
  return readAppUsers(event)
})
