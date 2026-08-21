import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(async () => {
  throw createError({
    statusCode: 410,
    statusMessage:
      'The legacy registry database is retired. Use /api/directory for the App and Ecosystem directory.',
  })
})
