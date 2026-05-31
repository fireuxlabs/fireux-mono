import { getQuery } from 'h3'
import {
  normalizePublicMenuSlug,
  rootMenuDocumentRef,
  validatePublicMenuSlug,
} from '../../utils/menuPublicRecords'

export default defineEventHandler(async (event) => {
  const slug = normalizePublicMenuSlug(getQuery(event).id)
  const validation = validatePublicMenuSlug(slug)

  if (!validation.isValid) {
    return {
      id: slug,
      is_valid: false,
      taken: false,
      available: false,
      message: validation.message || 'Menu path is not valid.',
    }
  }

  const snap = await rootMenuDocumentRef(slug).get()

  return {
    id: slug,
    is_valid: true,
    taken: snap.exists,
    available: !snap.exists,
  }
})
