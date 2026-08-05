import { defineEventHandler } from 'h3'
import {
  absoluteUrl,
  escapeXml,
  readRuntimeSeoSitemaps,
  setSitemapResponseHeaders,
} from 'fireux-core/runtime/server/utils/seo-sitemaps'
import {
  isDirectoryAppIndexable,
  isDirectoryEcosystemIndexable,
  readPlatformDirectory,
} from '../../utils/platform-directory'

export default defineEventHandler(async (event) => {
  const { siteUrl } = readRuntimeSeoSitemaps()
  const directory = await readPlatformDirectory()
  const paths = [
    ...directory.ecosystems
      .filter((ecosystem) => isDirectoryEcosystemIndexable(ecosystem.id))
      .map((ecosystem) => ecosystem.detail_url),
    ...directory.apps
      .filter((app) => isDirectoryAppIndexable(app.id))
      .map((app) => app.detail_url),
  ]
  const entries = [...new Set(paths)]
    .sort((left, right) => left.localeCompare(right))
    .map((path) => absoluteUrl(siteUrl, path))

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
