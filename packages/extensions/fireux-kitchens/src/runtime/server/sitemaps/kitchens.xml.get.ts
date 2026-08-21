import { createError, defineEventHandler } from 'h3'
import {
  absoluteUrl,
  escapeXml,
  readRuntimeSeoSitemaps,
  setSitemapResponseHeaders,
} from 'fireux-core/runtime/server/utils/seo-sitemaps'
import { readKitchens } from '../../kitchen/server/index/read.ts'

const MAX_SITEMAP_URLS = 50_000

export default defineEventHandler(async (event) => {
  const { siteUrl } = readRuntimeSeoSitemaps()
  const paths: string[] = []
  const kitchens = await readKitchens()
  paths.push(
    ...kitchens.map(
      (kitchen) => `/kitchens/${encodeURIComponent(kitchen.slug)}`
    )
  )
  if (paths.length > MAX_SITEMAP_URLS) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Kitchen sitemap requires pagination.',
    })
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...paths.map((path) => {
      const loc = escapeXml(absoluteUrl(siteUrl, path))
      return `  <url><loc>${loc}</loc></url>`
    }),
    '</urlset>',
    '',
  ].join('\n')

  setSitemapResponseHeaders(event)
  return xml
})
