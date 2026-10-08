import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import {
  PROPERTY_DIRECTORY_MAX_PAGE_SIZE,
  PROPERTY_DIRECTORY_PAGE_SIZE,
  type PropertyDirectoryEntry,
  type PropertyDirectoryPage,
} from '../../models/property-index.model.ts'
import { PropertyStorage } from '../../models/property.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PROPERTY_DIRECTORY_MAX_PAGE_SIZE)
    : PROPERTY_DIRECTORY_PAGE_SIZE
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

const invalidSource = (): never => {
  throw createError({
    statusCode: 500,
    statusMessage: 'Property directory source is invalid.',
  })
}

function propertyDirectoryEntry(document: {
  id: string
  data: Record<string, unknown>
}): PropertyDirectoryEntry | null {
  const source = document.data
  const identity = source.identity
  if (!identity || typeof identity !== 'object' || Array.isArray(identity))
    return null
  const publication = identity as Record<string, unknown>
  if (
    publication.status !== 'active' ||
    publication.publication_state !== 'published'
  )
    return null
  const publicIdentity = identity as Record<string, unknown>
  const name =
    typeof publicIdentity.name === 'string' ? publicIdentity.name.trim() : ''
  const slug =
    typeof publicIdentity.slug === 'string' ? publicIdentity.slug.trim() : ''
  const unitCount = publicIdentity.unit_count
  const propertyType = publicIdentity.property_type
  if (
    !isFirestoreDocumentId(document.id) ||
    !slug ||
    !name ||
    typeof unitCount !== 'number' ||
    !Number.isSafeInteger(unitCount) ||
    unitCount < 0 ||
    (propertyType !== 'residential' &&
      propertyType !== 'commercial' &&
      propertyType !== 'mixed') ||
    (publicIdentity.image_url !== undefined &&
      typeof publicIdentity.image_url !== 'string')
  )
    return invalidSource()

  // Public summaries validate only their own contract. Management, valuation,
  // stamps and private support never enter the returned discovery projection.
  const imageUrl = text(publicIdentity.image_url)
  return {
    id: document.id,
    slug,
    name,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    property_type: propertyType,
    unit_count: unitCount,
  }
}

export async function readPropertyDirectoryPage(input: {
  limit?: unknown
  cursor?: unknown
}): Promise<PropertyDirectoryPage> {
  const db = getRuntimeFirestore()
  const limit = pageSize(input.limit)
  const requestedCursor = text(input.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Property cursor is invalid.',
    })
  }

  let propertyQuery = db
    .collection(PropertyStorage.rootCollection)
    .orderBy(FieldPath.documentId())
    .limit(limit + 1)
  if (cursor) propertyQuery = propertyQuery.startAfter(cursor)

  const snapshot = await propertyQuery.get().catch(() => {
    throw createError({
      statusCode: 503,
      statusMessage: 'Property directory could not be read.',
    })
  })
  const hasMore = snapshot.docs.length > limit
  const pageDocs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs
  const items = pageDocs
    .map((document) =>
      propertyDirectoryEntry({
        id: document.id,
        data: document.data() || {},
      })
    )
    .filter((item): item is PropertyDirectoryEntry => Boolean(item))
  const nextCursor =
    hasMore && pageDocs.length
      ? encodeCursor(pageDocs[pageDocs.length - 1]?.id || '')
      : ''

  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
  }
}
