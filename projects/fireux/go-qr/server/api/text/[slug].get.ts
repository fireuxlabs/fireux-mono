import { defineEventHandler, getRouterParam } from 'h3'
import {
  normalizeTextQrId,
  readGoQrTextRecord,
  serializeGoQrTextRecord,
} from '../../utils/goQrTextRecords'

export default defineEventHandler(async (event) => {
  const slug = normalizeTextQrId(getRouterParam(event, 'slug'))
  const record = await readGoQrTextRecord(slug)
  return record ? serializeGoQrTextRecord(record) : null
})
