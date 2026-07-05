import { defineEventHandler, getQuery } from 'h3'
import { setCorsHeaders } from 'fireux-core/runtime/server/utils/http/cors.ts'
import { checkPublicSlugAvailability } from 'fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { MenuStorage } from '../../../models/kitchen/menu/menu.model.ts'

const reservedSlugs = [
  'about',
  'admin',
  'api',
  'assets',
  'console',
  'help',
  'menus',
  'pricing',
  'privacy',
  'solutions',
  'terms',
]

export default defineEventHandler(async (event) => {
  setCorsHeaders(event, {
    methods: ['GET'],
  })

  const result = await checkPublicSlugAvailability(getQuery(event).id, {
    label: 'Menu path',
    reservedScope: 'entity',
    reserved: reservedSlugs,
    exists: async (slug) =>
      (
        await getRuntimeFirestore()
          .collection(MenuStorage.rootCollection)
          .doc(slug)
          .get()
      ).exists,
  })

  return {
    id: result.slug,
    is_valid: result.isValid,
    taken: result.taken,
    available: result.available,
    message: result.message,
  }
})
