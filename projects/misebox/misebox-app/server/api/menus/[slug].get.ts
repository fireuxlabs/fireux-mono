import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  normalizePublicMenuSlug,
  readPublicMenuRecord,
  serializePublicMenuRecord,
} from '../../utils/menuPublicRecords'

export default defineEventHandler(async (event) => {
  const slug = normalizePublicMenuSlug(getRouterParam(event, 'slug'))
  const record = await readPublicMenuRecord(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found',
    })
  }

  return serializePublicMenuRecord(record)
})
