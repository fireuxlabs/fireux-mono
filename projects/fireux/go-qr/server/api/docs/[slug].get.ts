import { createError, getRouterParam } from 'h3'
import {
  readGoQrDocRecord,
  serializeGoQrDocRecord,
} from '../../utils/goQrDocs'

export default defineEventHandler(async (event) => {
  const record = await readGoQrDocRecord(getRouterParam(event, 'slug') || '')

  if (!record) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Go QR document not found.',
    })
  }

  return serializeGoQrDocRecord(record)
})
