import { defineEventHandler } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors'

export default defineEventHandler((event) => {
  setCorsHeaders(event, {
    methods: ['POST', 'OPTIONS'],
  })

  return null
})
