import { createError, defineEventHandler, getRouterParam } from 'h3'
import { documentKindFromFile } from 'fireux-core/runtime/server/utils/files/document-kind.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

export default defineEventHandler(async (event) => {
  const menuId = String(getRouterParam(event, 'menuId') || '').trim()
  if (!menuId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const snap = await getRuntimeFirestore()
    .collection('menus')
    .doc(menuId)
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
    id: menuId,
    slug: readRecordString(data, 'slug') || menuId,
    name: readRecordString(data, 'name') || menuId,
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
    kitchen_id: readRecordString(data, 'kitchen_id'),
    created_by: readRecordString(data, 'created_by'),
  }
})
