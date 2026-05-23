import { defineEventHandler } from 'h3'
import { listGoQrRecords } from '../../utils/goQrRecords'

export default defineEventHandler(async () => {
  const documents = await listGoQrRecords()

  return {
    ok: true,
    documents,
  }
})
