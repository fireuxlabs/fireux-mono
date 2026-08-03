import { createError, defineEventHandler } from 'h3'
import {
  absoluteUrl,
  escapeXml,
  readRuntimeSeoSitemaps,
  setSitemapResponseHeaders,
} from 'fireux-core/runtime/server/utils/seo-sitemaps.ts'
import { PUBLIC_JOB_INDEX_MAX_PAGE_SIZE } from '../../models/job-public.model.ts'
import { readPublicJobIndexPage } from '../job/public-index.ts'

const MAX_SITEMAP_URLS = 50_000

export default defineEventHandler(async (event) => {
  const { siteUrl } = readRuntimeSeoSitemaps()
  const paths: string[] = []
  const seenCursors = new Set<string>()
  let cursor = ''
  let hasMore = false

  while (paths.length < MAX_SITEMAP_URLS) {
    const page = await readPublicJobIndexPage(event, {
      cursor,
      limit: PUBLIC_JOB_INDEX_MAX_PAGE_SIZE,
    })
    paths.push(
      ...page.items.map((item) => `/jobs/${encodeURIComponent(item.id)}`)
    )

    hasMore = Boolean(page.nextCursor)
    if (paths.length > MAX_SITEMAP_URLS) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job sitemap requires pagination.',
      })
    }
    if (!page.nextCursor) break
    if (seenCursors.has(page.nextCursor)) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Job sitemap cursor did not advance.',
      })
    }
    seenCursors.add(page.nextCursor)
    cursor = page.nextCursor
  }

  if (paths.length >= MAX_SITEMAP_URLS && hasMore) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Job sitemap requires pagination.',
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
