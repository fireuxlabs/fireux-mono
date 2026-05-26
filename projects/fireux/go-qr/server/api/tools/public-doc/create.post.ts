import { defineEventHandler, readMultipartFormData } from 'h3'
import { createGoQrDocumentFromMultipart } from '../../../utils/goQrRecords'

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event)
  return await createGoQrDocumentFromMultipart(parts, { type: 'doc' })
})
