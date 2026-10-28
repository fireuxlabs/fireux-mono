import { defineEventHandler, setResponseHeader, setResponseHeaders } from 'h3'

import { readAppAdmins } from '../../../app/server/index/admins'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  return readAppAdmins(event)
})
