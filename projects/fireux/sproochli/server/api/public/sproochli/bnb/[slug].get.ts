import {
  createError,
  defineEventHandler,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { resolveBnbGuide } from '../../../../../app/content/bnbGuides'

export default defineEventHandler((event) => {
  const slug = String(getRouterParam(event, 'slug') || '')
  const guide = resolveBnbGuide(slug)

  if (!guide) {
    throw createError({
      statusCode: 404,
      statusMessage: 'BNB guide not found',
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  })

  return {
    type: guide.type,
    slug: guide.slug,
    language: guide.language,
    property: guide.property,
    sections: guide.sections,
    privacy_note: guide.privacy_note,
  }
})
