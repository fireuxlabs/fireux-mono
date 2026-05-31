import { createError, defineEventHandler, getRouterParam } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'

export default defineEventHandler(async (event) => {
  const slug = String(getRouterParam(event, 'slug') || '').trim()
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Menu path is required.',
    })
  }

  const snap = await getRuntimeFirestore()
    .collection('menus')
    .doc(slug)
    .get()

  if (!snap.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Menu not found.',
    })
  }

  const data = snap.data() || {}

  return {
    id: slug,
    slug,
    name: String(data.name || slug),
    description: String(data.description || ''),
    status: String(data.status || ''),
    doc_url: String(data.doc_url || ''),
    doc_name: String(data.doc_name || ''),
    doc_type: String(data.doc_type || ''),
  }
})
