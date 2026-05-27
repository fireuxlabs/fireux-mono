import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  normalizeMenuQrSlug,
  readMenuQrDocument,
  serializeMenuQrDocument,
} from '../../utils/menuQrDocuments'

export default defineEventHandler(async (event) => {
  const slug = normalizeMenuQrSlug(getRouterParam(event, 'slug'))
  const record = await readMenuQrDocument(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found',
    })
  }

  return serializeMenuQrDocument(record)
})
