import { defineEventHandler, setResponseHeaders, setResponseStatus } from 'h3'

export default defineEventHandler((event) => {
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type,authorization',
  })
  setResponseStatus(event, 204)
  return null
})
