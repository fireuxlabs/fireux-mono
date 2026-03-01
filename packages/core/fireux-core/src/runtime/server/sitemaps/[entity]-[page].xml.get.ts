import { createError, defineEventHandler } from 'h3'
import {
  absoluteUrl,
  escapeXml,
  fetchEntitySitemapPage,
  readRuntimeSeoSitemaps,
  setSitemapResponseHeaders,
} from '../utils/seo-sitemaps'

export default defineEventHandler(async (event) => {
  const requestPath = String(event.path || event.node.req.url || '')
    .split('?')[0]
    .trim()
  const match =
    requestPath.match(/^\/sitemaps\/(.+)-([0-9]+)\.xml$/i) ||
    requestPath.match(/^\/sitemaps\/(.+)-([0-9]+)$/i)

  const entityKey = String(match?.[1] || '').trim()
  const pageRaw = String(match?.[2] || '').trim()
  const page = Number(pageRaw)

  if (!entityKey || !Number.isFinite(page) || page < 1) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid sitemap entity/page request',
    })
  }

  const { siteUrl, entities } = readRuntimeSeoSitemaps()
  const entity = entities.find((entry) => entry.entityKey === entityKey)
  if (!entity) {
    throw createError({
      statusCode: 404,
      statusMessage: `Unknown sitemap entity: ${entityKey}`,
    })
  }

  const entries = await fetchEntitySitemapPage(entity, Math.trunc(page))
  if (!entries.length) {
    throw createError({
      statusCode: 404,
      statusMessage: `No sitemap entries for entity: ${entityKey}, page: ${page}`,
    })
  }

  const xmlRows = entries.map((entry) => {
    const loc = escapeXml(absoluteUrl(siteUrl, entry.path))
    const lastmod = entry.lastmod
      ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>`
      : ''
    return `  <url><loc>${loc}</loc>${lastmod}</url>`
  })

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...xmlRows,
    '</urlset>',
    '',
  ].join('\n')

  setSitemapResponseHeaders(event)
  return xml
})
