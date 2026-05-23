import { defineEventHandler, getRouterParam } from 'h3'
import {
  assertGoQrAdmin,
  deleteGoQrRecord,
  normalizeDocumentId,
} from '../../utils/goQrRecords'

export default defineEventHandler(async (event) => {
  await assertGoQrAdmin(event)

  const slug = normalizeDocumentId(getRouterParam(event, 'slug'))
  const record = await deleteGoQrRecord(slug)

  return {
    ok: true,
    slug: record.slug,
  }
})
