import { defineEventHandler, getQuery } from 'h3'
import {
  normalizeTextQrId,
  textQrAvailability,
} from '../../../utils/goQrTextRecords'

function readId(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return normalizeTextQrId(raw)
}

export default defineEventHandler(async (event) => {
  const availability = await textQrAvailability(readId(getQuery(event).id))

  return {
    id: availability.slug,
    taken: availability.taken,
    available: availability.available,
    is_valid: availability.isValid,
    message: availability.message,
  }
})
