import { defineEventHandler, setResponseStatus } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'

export default defineEventHandler((event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })
  setResponseStatus(event, 204)

  return null
})
