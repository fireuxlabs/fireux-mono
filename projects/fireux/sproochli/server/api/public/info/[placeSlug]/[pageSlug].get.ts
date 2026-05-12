import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
  setResponseHeaders,
} from 'h3'
import { resolveSproochliInfoPage } from '../../../../../app/content/sampleInfo'

export default defineEventHandler((event) => {
  const placeSlug = String(getRouterParam(event, 'placeSlug') || '')
  const pageSlug = String(getRouterParam(event, 'pageSlug') || '')
  const query = getQuery(event)
  const language = typeof query.lang === 'string' ? query.lang : 'en'

  const info = resolveSproochliInfoPage(placeSlug, pageSlug, language)
  if (!info) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Info page not found',
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=60, s-maxage=300',
  })

  return info
})
