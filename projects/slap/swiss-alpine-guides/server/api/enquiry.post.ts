import {
  createError,
  defineEventHandler,
  readRawBody,
  getHeader,
  setHeader,
} from 'h3'
import { prepareEnquiryDraft } from '../utils/enquiry'

export default defineEventHandler(async (event) => {
  setHeader(event, 'Cache-Control', 'no-store')
  if (!getHeader(event, 'content-type')?.startsWith('application/json'))
    throw createError({ statusCode: 415, statusMessage: 'Use a JSON enquiry.' })
  if (Number(getHeader(event, 'content-length')) > 10_000)
    throw createError({
      statusCode: 413,
      statusMessage: 'Enquiry is too large.',
    })
  const raw = await readRawBody(event)
  if (!raw || Buffer.byteLength(raw) > 10_000)
    throw createError({
      statusCode: 413,
      statusMessage: 'Check the enquiry size.',
    })
  try {
    // No delivery, persistence, calendar effect or booking allocation.
    return prepareEnquiryDraft(JSON.parse(raw))
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof SyntaxError
          ? 'Check the enquiry format.'
          : error instanceof Error
            ? error.message
            : 'Check your enquiry details.',
    })
  }
})
