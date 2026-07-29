// Concurrent edit — 2026-07-24 17:35 CEST — Kitchen public family: consume the shared strict index/detail projection.
import { FieldPath, Filter } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig.ts'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  PUBLIC_KITCHEN_INDEX_PAGE_SIZE,
  type PublicKitchenIndexItem,
  type PublicKitchenIndexPage,
} from '../../../models/kitchen/kitchen-index.model.ts'
import {
  hydrateKitchenPublicDocuments,
  isPublishedKitchen,
  projectPublicKitchenIndexItem,
  type KitchenPublicDirectoryScope,
} from '../../kitchen/public-projection.ts'

const text = (value: unknown) => String(value ?? '').trim()
const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_KITCHEN_INDEX_PAGE_SIZE
}

const encodeCursor = (value: string) =>
  Buffer.from(value, 'utf8').toString('base64url')

const decodeCursor = (value: unknown) => {
  const cursor = text(value)
  if (!cursor || !/^[A-Za-z0-9_-]+$/.test(cursor)) return ''

  try {
    const id = Buffer.from(cursor, 'base64url').toString('utf8')
    return isFirestoreDocumentId(id) && encodeCursor(id) === cursor ? id : ''
  } catch {
    return ''
  }
}

async function requirePrivateKitchenIndex(
  event: H3Event,
  db: ReturnType<typeof getRuntimeFirestore>
) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to preview all Kitchens.'
  )
  const { appId, developerId } = useFireUXConfig()
  const isDeveloper = import.meta.dev && uid === text(developerId)
  const membership = await db.doc(`apps/${appId}/users/${uid}`).get()
  const isAdmin = membership.exists && text(membership.data()?.role) === 'admin'

  if (!isAdmin && !isDeveloper) {
    throw createError({
      statusCode: 403,
      statusMessage: 'App admin access is required to preview all Kitchens.',
    })
  }

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })
}

export default defineEventHandler(async (event): Promise<PublicKitchenIndexPage> => {
  const db = getRuntimeFirestore()
  const fireux = useFireUXConfig()
  const directoryScope: KitchenPublicDirectoryScope = {
    appId: fireux.appId,
    ecosystemId: text(fireux.ecosystemId || fireux.ecosystem),
    role: fireux.role,
  }
  const query = getQuery(event)
  const requestedAll = text(query.visibility) === 'all'
  const includeAll = import.meta.dev || requestedAll
  if (text(query.visibility) && !requestedAll) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen visibility mode is invalid.',
    })
  }
  if (requestedAll) {
    await requirePrivateKitchenIndex(event, db)
  } else if (includeAll) {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })
  } else {
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control':
        'public, max-age=60, s-maxage=300, stale-while-revalidate=900',
    })
  }

  const limit = pageSize(query.limit)
  const requestedCursor = text(query.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen cursor is invalid.',
    })
  }

  const collection = db.collection('kitchens')
  let kitchenQuery = includeAll
    ? collection.orderBy(FieldPath.documentId()).limit(limit + 1)
    : collection
        .where(Filter.or(
          Filter.where('visibility.show', '==', true),
          Filter.where('show', '==', true)
        ))
        .orderBy(FieldPath.documentId())
        .limit(limit + 1)
  if (cursor) kitchenQuery = kitchenQuery.startAfter(cursor)

  const snapshot = await kitchenQuery.get()
  const hasMore = snapshot.docs.length > limit
  const pageDocs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs
  const documents = pageDocs
    .map(document => ({
      id: document.id,
      data: document.data() || {},
    }))
    .filter(document => includeAll || isPublishedKitchen(document.data))
  const dataByPath = await hydrateKitchenPublicDocuments(db, documents)
  const items = documents
    .map(document =>
      projectPublicKitchenIndexItem(document, dataByPath, directoryScope)
    )
    .filter((item): item is PublicKitchenIndexItem => Boolean(item))
  const nextCursor = hasMore && pageDocs.length
    ? encodeCursor(pageDocs[pageDocs.length - 1]?.id || '')
    : ''

  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
  }
})
