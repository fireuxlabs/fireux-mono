import { defineEventHandler, setResponseHeaders } from 'h3'
import { readAppMeta } from '../../../app/server/index/meta'

export default defineEventHandler(async (event) => {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': '*',
  })
  return readAppMeta(event)
})
