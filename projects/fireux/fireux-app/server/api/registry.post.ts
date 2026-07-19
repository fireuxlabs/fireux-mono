import { createError, defineEventHandler } from 'h3'

export default defineEventHandler(() => {
  throw createError({
    statusCode: 410,
    statusMessage:
      'Direct registry writes are retired. Publish canonical App and Ecosystem projections through the directory pipeline.',
  })
})
