import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  normalizeMenuQrSlug,
  readMenuDocument,
  serializeMenuDocument,
} from '../../utils/menuQrDocuments'

export default defineEventHandler(async (event) => {
  const slug = normalizeMenuQrSlug(getRouterParam(event, 'slug'))
  const record = await readMenuDocument(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found',
    })
  }

  return serializeMenuDocument(record)
})
