import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'

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
  const docName = readRecordString(data, 'doc_name')
  const docType = readRecordString(data, 'doc_type')

  return {
    id: slug,
    slug,
    name: readRecordString(data, 'name') || slug,
    description: readRecordString(data, 'description'),
    doc_url: readRecordString(data, 'doc_url'),
    doc_name: docName,
    doc_type: docType,
    kind: documentKindFromFile({
      fileName: docName,
      contentType: docType,
      storedKind: readRecordString(data, 'doc_kind'),
    }),
    doc_storage_path: readRecordString(data, 'doc_storage_path'),
  }
})
