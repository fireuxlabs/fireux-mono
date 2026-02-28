import { defineEventHandler } from 'h3'
import {
  absoluteUrl,
  escapeXml,
  readRuntimeSeoSitemaps,
  setSitemapResponseHeaders,
} from '../utils/seo-sitemaps'

export default defineEventHandler((event) => {
  const { siteUrl, staticPaths } = readRuntimeSeoSitemaps()
  const entries = staticPaths.map((path) => absoluteUrl(siteUrl, path))

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((loc) => `  <url><loc>${escapeXml(loc)}</loc></url>`),
    '</urlset>',
    '',
  ].join('\n')

  setSitemapResponseHeaders(event)
  return xml
})
