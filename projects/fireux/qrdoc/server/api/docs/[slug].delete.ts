import { defineEventHandler, getRouterParam } from 'h3'
import {
  assertQrdocAdmin,
  deleteQrdocDocument,
  normalizeDocumentId,
} from '../../utils/qrdocDocuments'

export default defineEventHandler(async (event) => {
  await assertQrdocAdmin(event)

  const slug = normalizeDocumentId(getRouterParam(event, 'slug'))
  const record = await deleteQrdocDocument(slug)

  return {
    ok: true,
    slug: record.slug,
  }
})
