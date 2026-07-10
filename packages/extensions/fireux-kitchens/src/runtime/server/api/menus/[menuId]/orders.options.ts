import { defineEventHandler, setResponseStatus } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'

export default defineEventHandler((event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
    headers: ['content-type', 'authorization'],
  })
  setResponseStatus(event, 204)

  return null
})
