#!/usr/bin/env node

import { initializeApp, getApps } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const DEFAULT_COLLECTIONS = [
  'seo_index_users',
  'seo_index_jobs',
  'seo_index_agents',
  'seo_index_professionals',
  'seo_index_chefs',
  'seo_index_kitchens',
  'seo_index_places',
  'seo_index_companies',
  'seo_index_suppliers',
  'seo_index_products',
  'seo_index_blogs',
  'seo_index_recipes',
]

function parseArgs() {
  const args = process.argv.slice(2)
  const collections = args.filter((arg) => !arg.startsWith('--'))
  const pageSizeArg = args.find((arg) => arg.startsWith('--page-size='))
  const pageSize = pageSizeArg
    ? Number(pageSizeArg.split('=')[1] || '')
    : Number(process.env.SITEMAP_PAGE_SIZE || 5000)

  return {
    collections: collections.length ? collections : DEFAULT_COLLECTIONS,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? Math.trunc(pageSize) : 5000,
  }
}

async function main() {
  const { collections, pageSize } = parseArgs()
  if (!getApps().length) initializeApp()
  const db = getFirestore()

  const rows = []
  for (const collectionName of collections) {
    const snap = await db
      .collection(collectionName)
      .where('isPublic', '==', true)
      .count()
      .get()

    const urlCount = Number(snap.data()?.count || 0)
    rows.push({
      collection: collectionName,
      urlCount,
      pages: Math.max(1, Math.ceil(urlCount / pageSize)),
    })
  }

  console.table(rows)
}

main().catch((error) => {
  console.error('[seo-sitemap-counts] failed', error)
  process.exitCode = 1
})
