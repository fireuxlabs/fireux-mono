import {
  createError,
  defineEventHandler,
  readBody,
  setResponseHeader,
} from 'h3'
import { prepareIgnitionPreview } from '../../../shared/ignition-preview'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'no-store')
  try {
    return prepareIgnitionPreview(await readBody(event))
  } catch (error) {
    throw createError({
      statusCode: 400,
      statusMessage:
        error instanceof Error ? error.message : 'Invalid preview brief.',
    })
  }
})
