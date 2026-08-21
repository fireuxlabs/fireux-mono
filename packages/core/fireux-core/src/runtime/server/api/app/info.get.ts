import { defineEventHandler, setResponseHeaders } from 'h3'
import { readAppInfo } from '../../../app/server/index/info'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })
  return readAppInfo(event)
})
