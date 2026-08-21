import { defineEventHandler, setResponseHeaders } from 'h3'
import { readAppAdmins } from '../../../app/server/index/admins'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  })
  return readAppAdmins(event)
})
