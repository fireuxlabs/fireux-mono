import { createError, defineEventHandler, getQuery, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'

const APP_ID = 'misebox-app'
const reservedSlugs = ['create', 'edit', 'index', 'new', 'qr', 'sections']

export default defineEventHandler(async (event) => {
  const kitchenId = String(getRouterParam(event, 'kitchenId') || '').trim()
  const slug = normalizeSlug(String(getQuery(event).id || ''))

  if (!kitchenId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen id is required.',
    })
  }

  const validation = validatePublicSlug(slug, {
    label: 'Menu path',
    reservedScope: 'entity',
    reserved: reservedSlugs,
  })
  if (!validation.isValid) {
    return {
      id: slug,
      is_valid: false,
      taken: false,
      available: false,
      message: validation.message || 'Menu path is not valid.',
    }
  }

  const doc = await getRuntimeFirestore()
    .collection('apps')
    .doc(APP_ID)
    .collection('kitchens')
    .doc(kitchenId)
    .collection('menus')
    .doc(slug)
    .get()

  return {
    id: slug,
    is_valid: true,
    taken: doc.exists,
    available: !doc.exists,
  }
})
