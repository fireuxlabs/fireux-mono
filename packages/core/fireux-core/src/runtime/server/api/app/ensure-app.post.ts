import { defineEventHandler, createError } from 'h3'

// Deprecated: This endpoint was unused and has been removed from the public API.
// Keeping a stub to prevent accidental reintroduction; returns 410 Gone if invoked.
export default defineEventHandler(() => {
  throw createError({ statusCode: 410, statusMessage: 'Endpoint removed' })
})
