// Concurrent edit — 2026-07-24 17:35 CEST — Kitchen public family: consume the shared strict index/detail projection.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  getQuery,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  PUBLIC_KITCHEN_INDEX_PAGE_SIZE,
  type PublicKitchenIndexItem,
  type PublicKitchenIndexPage,
} from '../../../models/kitchen/kitchen-index.model.ts'
import {
  hydrateKitchenPublicDocuments,
  projectPublicKitchenIndexItem,
  type KitchenPublicDirectoryScope,
} from '../../kitchen/public-projection.ts'

const text = (value: unknown) => String(value ?? '').trim()
const KITCHEN_COLLECTION_SCAN_LIMIT = 500
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

async function requireHiddenKitchenAccess(
  event: H3Event,
  db: ReturnType<typeof getRuntimeFirestore>
) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to view hidden Kitchens.'
  )
  const { appId, developerId } = useFireUXConfig()
  const isDeveloper = import.meta.dev && uid === text(developerId)
  const membership = await db.doc(`apps/${appId}/users/${uid}`).get()
  const isAdmin = membership.exists && text(membership.data()?.role) === 'admin'

  if (!isDeveloper && !isAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Developer or App admin access is required.',
    })
  }
}

export default defineEventHandler(
  async (event): Promise<PublicKitchenIndexPage> => {
    const query = getQuery(event)
    const includeHidden = text(query.includeHidden) === 'true'
    if (query.includeHidden && !includeHidden) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Hidden Kitchen mode is invalid.',
      })
    }
    const requestedPlaceId = text(query.placeId)
    if (requestedPlaceId && !isFirestoreDocumentId(requestedPlaceId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Place id is invalid.',
      })
    }
    if (query.visibility) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Kitchen collection visibility is not caller-selectable.',
      })
    }

    const db = getRuntimeFirestore()
    if (includeHidden) await requireHiddenKitchenAccess(event, db)
    const fireux = useFireUXConfig()
    const directoryScope: KitchenPublicDirectoryScope = {
      appId: fireux.appId,
      ecosystemId: text(fireux.ecosystemId || fireux.ecosystem),
      role: fireux.role,
      includeHidden,
    }
    setResponseHeaders(event, {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'private, no-store',
    })

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
    const items: PublicKitchenIndexItem[] = []
    let afterId = cursor
    let scanned = 0
    let exhausted = false
    let nextCursor = ''

    while (
      items.length < limit &&
      scanned < KITCHEN_COLLECTION_SCAN_LIMIT &&
      !exhausted
    ) {
      const scanLimit = Math.min(
        PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
        KITCHEN_COLLECTION_SCAN_LIMIT - scanned
      )
      let kitchenQuery = requestedPlaceId
        ? collection
            .where('place_id', '==', requestedPlaceId)
            .orderBy(FieldPath.documentId())
            .limit(scanLimit)
        : collection.orderBy(FieldPath.documentId()).limit(scanLimit)
      if (afterId) kitchenQuery = kitchenQuery.startAfter(afterId)

      const snapshot = await kitchenQuery.get()
      if (snapshot.empty) break
      const documents = snapshot.docs.map(document => ({
        id: document.id,
        data: document.data() || {},
      }))
      const dataByPath = await hydrateKitchenPublicDocuments(db, documents)

      for (const [index, document] of documents.entries()) {
        scanned += 1
        afterId = document.id
        const item = document.data.visibility === false && !includeHidden
          ? null
          : projectPublicKitchenIndexItem(
              document,
              dataByPath,
              directoryScope
            )
        if (item) items.push(item)
        if (items.length >= limit) {
          if (index < documents.length - 1 || documents.length === scanLimit) {
            nextCursor = encodeCursor(afterId)
          } else {
            exhausted = true
          }
          break
        }
      }

      if (items.length >= limit) break
      if (documents.length < scanLimit) exhausted = true
    }

    return {
      items,
      ...(!exhausted && nextCursor ? { nextCursor } : {}),
    }
  }
)
