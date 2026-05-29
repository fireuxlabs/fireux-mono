import { defineEventHandler, getQuery } from 'h3'
import { checkPublicSlugAvailability } from 'fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability.ts'
import {
  normalizePublicMenuSlug,
  reservedPublicMenuSlugs,
  rootMenuDocumentRef,
} from '../../utils/menuPublicRecords'

function readId(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return normalizePublicMenuSlug(raw)
}

export default defineEventHandler(async (event) => {
  const id = readId(getQuery(event).id)
  const availability = await checkPublicSlugAvailability(id, {
    label: 'Menu path',
    reservedScope: 'root',
    reserved: reservedPublicMenuSlugs,
    takenMessage: 'This menu path is already taken.',
    exists: async (slug) => {
      const snap = await rootMenuDocumentRef(slug).get()
      return snap.exists
    },
  })

  return {
    id: availability.slug,
    taken: availability.taken,
    available: availability.available,
    is_valid: availability.isValid,
    message: availability.message,
  }
})
