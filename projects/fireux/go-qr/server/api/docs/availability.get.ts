import { defineEventHandler, getQuery } from 'h3'
import { checkPublicSlugAvailability } from 'fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import {
  goQrCollectionName,
  normalizeDocumentId,
} from '../../utils/goQrRecords'

const reservedDocumentIds = [
  'about',
  'blog',
  'docs',
  'food-menu',
  'get-started',
  'help',
  'pricing',
  'privacy',
  'products',
  'terms',
]

function readId(value: unknown) {
  const raw = Array.isArray(value) ? value[0] : value
  return normalizeDocumentId(raw)
}

export default defineEventHandler(async (event) => {
  const id = readId(getQuery(event).id)
  const db = getRuntimeFirestore('go-qr')
  const availability = await checkPublicSlugAvailability(id, {
    label: 'Document path',
    reservedScope: 'root',
    reserved: reservedDocumentIds,
    takenMessage: 'This doc path is already taken.',
    exists: async (slug) => {
      const snap = await db.collection(goQrCollectionName).doc(slug).get()
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
