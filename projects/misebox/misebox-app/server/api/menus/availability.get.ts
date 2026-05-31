import { defineEventHandler, getQuery, setResponseHeaders } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug.ts'
import { validatePublicSlug } from 'fireux-core/runtime/utils/slug/validatePublicSlug.ts'

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
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type',
  })

  const slug = normalizeSlug(String(getQuery(event).id || ''))
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
