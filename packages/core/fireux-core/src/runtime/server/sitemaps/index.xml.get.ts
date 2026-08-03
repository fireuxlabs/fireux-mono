import { defineEventHandler } from 'h3'
import {
  absoluteUrl,
  countPublicEntitySitemapDocs,
  escapeXml,
  readRuntimeSeoSitemaps,
  setSitemapResponseHeaders,
} from '../utils/seo-sitemaps'

export default defineEventHandler(async (event) => {
  const { siteUrl, documents, entities } = readRuntimeSeoSitemaps()
  const sitemapEntries = [
    absoluteUrl(siteUrl, '/sitemaps/static.xml'),
    ...documents.map((path) => absoluteUrl(siteUrl, path)),
  ]

  for (const entity of entities) {
    const count = await countPublicEntitySitemapDocs(entity)
    if (count <= 0) continue

    const pages = Math.ceil(count / entity.pageSize)
    for (let page = 1; page <= pages; page += 1) {
      sitemapEntries.push(
        absoluteUrl(siteUrl, `/sitemaps/${entity.entityKey}-${page}.xml`)
      )
    }
  }

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries.map(
      (loc) => `  <sitemap><loc>${escapeXml(loc)}</loc></sitemap>`
    ),
    '</sitemapindex>',
    '',
  ].join('\n')

  setSitemapResponseHeaders(event)
  return xml
})
