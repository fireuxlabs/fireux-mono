import {
  createError,
  defineEventHandler,
  getRouterParam,
  sendRedirect,
  sendStream,
  setHeader,
} from 'h3'
import {
  normalizeDocumentId,
  goQrStorageBucket,
  readGoQrRecord,
} from '../../../utils/goQrRecords'

export default defineEventHandler(async (event) => {
  const slug = normalizeDocumentId(getRouterParam(event, 'slug'))
  const record = await readGoQrRecord(slug)

  if (!record || !record.is_public) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Go QR document not found',
    })
  }

  if (!record.storage_path && /^https?:\/\//i.test(record.file_url || '')) {
    return sendRedirect(event, record.file_url, 302)
  }

  const storageFile = goQrStorageBucket().file(record.storage_path)
  const [exists] = await storageFile.exists()
  if (!exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Go QR file not found',
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
