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
} from '../../../app/utils/directorySearchPolicy'
import { readPlatformApps } from '../../utils/apps'
import { readPlatformEcosystems } from '../../utils/ecosystems'

export default defineEventHandler(async (event) => {
  const { siteUrl } = readRuntimeSeoSitemaps()
  const [ecosystems, apps] = await Promise.all([
    readPlatformEcosystems(),
    readPlatformApps(),
  ])
  const paths = [
    ...ecosystems
      .filter((ecosystem) => isDirectoryEcosystemIndexable(ecosystem.id))
      .map((ecosystem) => `/ecosystems/${encodeURIComponent(ecosystem.id)}`),
    ...apps
      .filter((app) => isDirectoryAppIndexable(app.id))
      .map((app) => `/apps/${encodeURIComponent(app.id)}`),
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
