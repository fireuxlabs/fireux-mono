import {
  createError,
  defineEventHandler,
  getRouterParam,
  sendStream,
  setHeader,
} from 'h3'
import {
  normalizeDocumentId,
  qrdocStorageBucket,
  readQrdocDocument,
} from '../../../utils/qrdocDocuments'

export default defineEventHandler(async (event) => {
  const slug = normalizeDocumentId(getRouterParam(event, 'slug'))
  const record = await readQrdocDocument(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'QRdocs document not found',
    })
  }

  const storageFile = qrdocStorageBucket().file(record.storage_path)
  const [exists] = await storageFile.exists()
  if (!exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'QRdocs file not found',
    })
  }

  setHeader(event, 'content-type', record.file_type || 'application/octet-stream')
  setHeader(event, 'cache-control', 'public, max-age=300')
  setHeader(
    event,
    'content-disposition',
    `inline; filename="${record.file_name.replace(/"/g, '')}"`
  )

  return sendStream(event, storageFile.createReadStream())
})
