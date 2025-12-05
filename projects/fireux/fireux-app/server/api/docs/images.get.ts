import { createError, defineEventHandler } from 'h3'
// Legacy endpoint retained temporarily for compatibility.
// Nuxt Content now serves the FireUX image specification directly,
// so we respond with a clear error to prompt clients to update.
export default defineEventHandler(() => {
  throw createError({
    statusCode: 410,
    statusMessage:
      'FireUX image spec API was removed; use /docs/images page instead.',
  })
})
