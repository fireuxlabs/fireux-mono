import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  KITCHEN_DIRECTORY_MAX_PAGE_SIZE,
  KITCHEN_DIRECTORY_PAGE_SIZE,
  type KitchenDirectoryEntry,
  type KitchenDirectoryPage,
} from '../../models/kitchen-directory.model.ts'
import {
  readKitchenRelatedRecords,
  projectKitchenDirectoryEntry,
  type KitchenReadScope,
} from '../identity/read.ts'

const text = (value: unknown) => String(value ?? '').trim()
const KITCHEN_DIRECTORY_SCAN_LIMIT = 500

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, KITCHEN_DIRECTORY_MAX_PAGE_SIZE)
    : KITCHEN_DIRECTORY_PAGE_SIZE
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

export type ReadKitchenDirectoryPageInput = {
  cursor?: unknown
  limit?: unknown
  placeId?: unknown
  includeHidden?: boolean
}

/** Canonical bounded Kitchen directory reader shared by API and sitemap. */
export async function readKitchenDirectoryPage(
  input: ReadKitchenDirectoryPageInput = {}
): Promise<KitchenDirectoryPage> {
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
  const readScope: KitchenReadScope = {
    ecosystem: fireux.ecosystem,
  }
  const db = getRuntimeFirestore()
  const collection = db.collection('kitchens')
  const items: KitchenDirectoryEntry[] = []
  let afterId = cursor
  let scanned = 0
  let exhausted = false
  let nextCursor = ''

  while (
    items.length < limit &&
    scanned < KITCHEN_DIRECTORY_SCAN_LIMIT &&
    !exhausted
  ) {
    const scanLimit = Math.min(
      KITCHEN_DIRECTORY_MAX_PAGE_SIZE,
      KITCHEN_DIRECTORY_SCAN_LIMIT - scanned
    )
    let kitchenQuery = requestedPlaceId
      ? collection
          .where(FieldPath.documentId(), '==', requestedPlaceId)
          .orderBy(FieldPath.documentId())
          .limit(scanLimit)
      : collection.orderBy(FieldPath.documentId()).limit(scanLimit)
    if (afterId) kitchenQuery = kitchenQuery.startAfter(afterId)

    const snapshot = await kitchenQuery.get().catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Kitchen directory could not be read.',
      })
    })
    if (snapshot.empty) break

    const documents = snapshot.docs.map((document) => ({
      id: document.id,
      data: document.data() || {},
    }))
    const dataByPath = await readKitchenRelatedRecords(
      db,
      documents,
      readScope
    ).catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Kitchen directory relationships could not be read.',
      })
    })

    for (const [index, document] of documents.entries()) {
      scanned += 1
      afterId = document.id
      const item = projectKitchenDirectoryEntry(document, dataByPath, readScope)
      if (item && (input.includeHidden === true || item.visible)) {
        items.push(item)
      }
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

  if (!exhausted && !nextCursor && afterId) {
    nextCursor = encodeCursor(afterId)
  }

  return {
    items,
    ...(!exhausted && nextCursor ? { nextCursor } : {}),
  }
}
