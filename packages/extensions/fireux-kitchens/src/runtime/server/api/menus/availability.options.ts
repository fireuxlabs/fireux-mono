import { defineEventHandler } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'

export default defineEventHandler((event) => {
  setCorsHeaders(event, {
    methods: ['GET', 'OPTIONS'],
  })

  return null
})
