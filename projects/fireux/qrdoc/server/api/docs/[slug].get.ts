import { createError, defineEventHandler, getRouterParam } from 'h3'
import {
  normalizeDocumentId,
  readQrdocDocument,
  serializeQrdocDocument,
} from '../../utils/qrdocDocuments'

export default defineEventHandler(async (event) => {
  const slug = normalizeDocumentId(getRouterParam(event, 'slug'))
  const record = await readQrdocDocument(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'QRdocs document not found',
    })
  }

  return serializeQrdocDocument(record)
})
