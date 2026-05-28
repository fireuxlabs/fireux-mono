import { defineEventHandler, readBody } from 'h3'
import { createGoQrTextRecord } from '../../../utils/goQrTextRecords'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    slug?: unknown
    text?: unknown
    display_label?: unknown
    qr_centre_label?: unknown
  }>(event)

  return await createGoQrTextRecord({
    slug: body?.slug,
    text: body?.text,
    displayLabel: body?.display_label,
    qrCentreLabel: body?.qr_centre_label,
  })
})
