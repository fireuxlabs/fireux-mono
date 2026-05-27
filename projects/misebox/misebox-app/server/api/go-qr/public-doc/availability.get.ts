import { defineEventHandler, getQuery } from 'h3'
import { checkPublicSlugAvailability } from 'fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability.ts'
import {
  menuQrDocumentRef,
  normalizeMenuQrSlug,
  reservedMenuQrSlugs,
} from '../../../utils/menuQrDocuments'

function readId(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return normalizeMenuQrSlug(raw)
}

export default defineEventHandler(async (event) => {
  const id = readId(getQuery(event).id)
  const availability = await checkPublicSlugAvailability(id, {
    label: 'Menu URL',
    reservedScope: 'root',
    reserved: reservedMenuQrSlugs,
    takenMessage: 'This menu URL is already taken.',
    exists: async (slug) => {
      const snap = await menuQrDocumentRef(slug).get()
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
