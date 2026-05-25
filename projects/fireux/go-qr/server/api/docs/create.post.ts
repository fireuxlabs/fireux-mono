import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import {
  assertDocumentId,
  createGoQrRecord,
  assertDocumentType,
  normalizeDocumentType,
  normalizeDocumentId,
  goQrRecordRef,
  goQrStorageBucket,
  safeStorageFileName,
} from '../../utils/goQrRecords'

const maxFileSizeMb = 10
const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024

function fieldValue(parts: Awaited<ReturnType<typeof readMultipartFormData>>, name: string) {
  const part = parts?.find((entry) => entry.name === name)
  return part?.data ? part.data.toString('utf8').trim() : ''
}

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  const filePart = parts?.find((part) => part.name === 'file' && part.filename)
  const slug = normalizeDocumentId(fieldValue(parts, 'slug'))
  const type = normalizeDocumentType(fieldValue(parts, 'type'))

  assertDocumentId(slug)
  assertDocumentType(type)

  if (!filePart?.data?.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Document file is required',
    })
  }

  if (filePart.data.byteLength > maxFileSizeBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Max file size is ${maxFileSizeMb} MB`,
    })
  }

  const docRef = goQrRecordRef(slug)
  const existing = await docRef.get()
  if (existing.exists) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Document path is already taken',
    })
  }

  const fileName = safeStorageFileName(filePart.filename)
  const fileType = String(filePart.type || 'application/octet-stream').trim()
  const storagePath = `go-qr/documents/${slug}/raw/${fileName}`
  const bucket = goQrStorageBucket()

  await bucket.file(storagePath).save(filePart.data, {
    contentType: fileType,
    resumable: false,
    metadata: {
      cacheControl: 'public, max-age=300',
    },
  })

  const record = createGoQrRecord({
    slug,
    type,
    fileName,
    fileType,
    storagePath,
  })

  await docRef.create(record)

  return {
    ok: true,
    slug,
    path: `/${encodeURIComponent(slug)}`,
    qr_path: `/${encodeURIComponent(slug)}/qr`,
  }
})
