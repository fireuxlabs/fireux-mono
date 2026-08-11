import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  PUBLIC_KITCHEN_INDEX_PAGE_SIZE,
  type PublicKitchenIndexItem,
  type PublicKitchenIndexPage,
} from '../../models/kitchen/kitchen-index.model.ts'
import {
  hydrateKitchenPublicDocuments,
  isPublishedKitchen,
  projectPublicKitchenIndexItem,
  type KitchenPublicDirectoryScope,
} from './public-projection.ts'

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

/**
 * Canonical bounded Kitchen directory reader shared by public JSON and sitemap
 * transport. Private Kitchen preview remains a separate authenticated outcome.
 */
export async function readPublicKitchenIndexPage(
  input: { cursor?: unknown; limit?: unknown; placeId?: unknown } = {}
): Promise<PublicKitchenIndexPage> {
  const requestedPlaceId = text(input.placeId)
  if (requestedPlaceId && !isFirestoreDocumentId(requestedPlaceId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Place id is invalid.',
    })
  }

  const limit = pageSize(input.limit)
  const requestedCursor = text(input.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen cursor is invalid.',
    })
  }

  const fireux = useFireUXConfig()
  const directoryScope: KitchenPublicDirectoryScope = {
    appId: fireux.appId,
    ecosystemId: text(fireux.ecosystemId || fireux.ecosystem),
    role: fireux.role,
  }
  const db = getRuntimeFirestore()
  const collection = db.collection('kitchens')
  let kitchenQuery = requestedPlaceId
    ? collection
        .where(FieldPath.documentId(), '==', requestedPlaceId)
        .orderBy(FieldPath.documentId())
        .limit(limit + 1)
    : collection
        .where('visibility', '==', true)
        .orderBy(FieldPath.documentId())
        .limit(limit + 1)
  if (cursor) kitchenQuery = kitchenQuery.startAfter(cursor)

  const snapshot = await kitchenQuery.get().catch(() => {
    throw createError({
      statusCode: 503,
      statusMessage: 'Kitchen directory could not be read.',
    })
  })
  const hasMore = snapshot.docs.length > limit
  const pageDocs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs
  const documents = pageDocs
    .map((document) => ({
      id: document.id,
      data: document.data() || {},
    }))
    .filter((document) => isPublishedKitchen(document.data))
  const dataByPath = await hydrateKitchenPublicDocuments(db, documents).catch(
    () => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Kitchen directory relationships could not be read.',
      })
    }
  )
  const items = documents
    .map((document) =>
      projectPublicKitchenIndexItem(document, dataByPath, directoryScope)
    )
    .filter((item): item is PublicKitchenIndexItem => Boolean(item?.visible))
  const nextCursor =
    hasMore && pageDocs.length
      ? encodeCursor(pageDocs[pageDocs.length - 1]?.id || '')
      : ''

  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
  }
}
