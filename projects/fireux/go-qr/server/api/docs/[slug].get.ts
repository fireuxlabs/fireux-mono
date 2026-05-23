import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  normalizeDocumentId,
  readGoQrRecord,
  serializeGoQrRecord,
} from '../../utils/goQrRecords'

export default defineEventHandler(async (event) => {
  const slug = normalizeDocumentId(getRouterParam(event, 'slug'))
  const record = await readGoQrRecord(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Go QR document not found',
    })
  }

  return serializeGoQrRecord(record)
})
