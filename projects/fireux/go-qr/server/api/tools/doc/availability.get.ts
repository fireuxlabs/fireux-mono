import {
  defineEventHandler,
  getQuery,
} from 'h3'
import { checkPublicSlugAvailability } from 'fireux-core/runtime/server/utils/slug/checkPublicSlugAvailability'
import {
  goQrDocRef,
  reservedGoQrDocSlugs,
} from '../../../utils/goQrDocs'

export default defineEventHandler(async (event) => {
  const result = await checkPublicSlugAvailability(getQuery(event).id, {
    label: 'Doc path',
    reservedScope: 'root',
    reserved: reservedGoQrDocSlugs,
    exists: async (slug) => (await goQrDocRef(slug).get()).exists,
  })

  return {
    id: result.slug,
    is_valid: result.isValid,
    taken: result.taken,
    available: result.available,
    message: result.message,
  }
})
