import { getQuery } from 'h3'
import {
  goQrDocRef,
  normalizeGoQrDocSlug,
  validateGoQrDocSlug,
} from '../../../utils/goQrDocs'

export default defineEventHandler(async (event) => {
  const slug = normalizeGoQrDocSlug(getQuery(event).id)
  const validation = validateGoQrDocSlug(slug)

  if (!validation.isValid) {
    return {
      id: slug,
      is_valid: false,
      taken: false,
      available: false,
      message: validation.message || 'Doc path is not valid.',
    }
  }

  const snap = await goQrDocRef(slug).get()

  return {
    id: slug,
    is_valid: true,
    taken: snap.exists,
    available: !snap.exists,
  }
})
