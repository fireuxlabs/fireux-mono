import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

const documentKind = (input: {
  fileName: string
  fileType: string
  storedKind: string
}) => {
  if (['photo', 'pdf', 'document'].includes(input.storedKind)) {
    return input.storedKind
  }

  const extension = input.fileName.toLowerCase().match(/\.[a-z0-9]+$/)?.[0] || ''
  const fileType = input.fileType.toLowerCase()
  if (fileType.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp'].includes(extension)) {
    return 'photo'
  }
  if (fileType === 'application/pdf' || extension === '.pdf') return 'pdf'
  return 'document'
}

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const snap = await getRuntimeFirestore()
    .collection('menus')
    .doc(slug)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}
  const docName = String(data.doc_name || '')
  const docType = String(data.doc_type || '')

  return {
    id: slug,
    slug,
    name: String(data.name || slug),
    description: String(data.description || ''),
    qr_centre_label: String(data.qr_centre_label || 'Food Menu'),
    doc_url: String(data.doc_url || ''),
    doc_name: docName,
    doc_type: docType,
    kind: documentKind({
      fileName: docName,
      fileType: docType,
      storedKind: String(data.doc_kind || ''),
    }),
    doc_storage_path: String(data.doc_storage_path || ''),
  }
})
