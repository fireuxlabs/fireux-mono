import { FieldPath, type Firestore, type Query } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { readAppDocument } from '../../utils/readApp'
import type { App } from '../../models/app.model'
import type { CollectionPage } from '../../../models/utils/directory'

const APP_PAGE_SIZE = 24
const APP_MAX_PAGE_SIZE = 100

export type AppReadScope = { ecosystemId?: string; activeOnly?: boolean; limit?: number; cursor?: string }

export function readAppPageInput(input: { limit?: unknown; cursor?: unknown }) {
  const limit = input.limit == null ? APP_PAGE_SIZE : Number(input.limit)
  const cursor = input.cursor == null ? '' : String(input.cursor)
  if (!Number.isInteger(limit) || limit < 1 || limit > APP_MAX_PAGE_SIZE || cursor.includes('/') || cursor.length > 1500) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid App page request.' })
  }
  return { limit, cursor }
}

/** One database query owner, reused by directory and parent relationships. */
export async function readAppRecords(db: Firestore, scope: AppReadScope = {}) {
  let query: Query = db.collection('apps')
  if (scope.ecosystemId) query = query.where('ecosystem_id', '==', scope.ecosystemId)
  // Filter before pagination so hidden records cannot consume a public page.
  if (scope.activeOnly) query = query.where('status', '==', 'active')
  query = query.orderBy(FieldPath.documentId())
  if (scope.cursor) query = query.startAfter(scope.cursor)
  if (scope.limit) query = query.limit(scope.limit)
  const snapshot = await query.get()
  return snapshot.docs.flatMap(document => {
    const app = readAppDocument(document.data(), document.id)
    if (!app) throw createError({ statusCode: 409, statusMessage: `App ${document.id} has an invalid stored shape.` })
    return scope.activeOnly && app.status !== 'active' ? [] : [app]
  })
}

export function appCollectionPage(items: App[], limit?: number): CollectionPage<App> {
  const sorted = [...items].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
  if (new Set(sorted.map(app => app.id)).size !== sorted.length) {
    throw createError({ statusCode: 409, statusMessage: 'Duplicate App identities exist across databases.' })
  }
  const page = limit ? sorted.slice(0, limit) : sorted
  return { ok: true, items: page, nextCursor: limit && sorted.length > limit ? page.at(-1)!.id : null }
}
