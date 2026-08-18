// Concurrent edit — 2026-07-20 22:39 CEST — Property public projection: page canonical roots and emit only the public Property card DTO.
// Concurrent edit — 2026-07-20 22:52 CEST — Both-Entity Authority: require explicit publication and canonical document identity.
import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { canonicalPropertyRoot } from '../../composables/firestore/utils/view/usePropertyInterface.ts'
import {
  PUBLIC_PROPERTY_INDEX_MAX_PAGE_SIZE,
  PUBLIC_PROPERTY_INDEX_PAGE_SIZE,
  type PublicPropertyIndexItem,
  type PublicPropertyIndexPage,
} from '../../models/property-index.model.ts'
import {
  PropertyStorage,
  type Property,
} from '../../models/property.model.ts'

const text = (value: unknown) => String(value ?? '').trim()

const pageSize = (value: unknown) => {
  const size = Number(value)
  return Number.isInteger(size) && size > 0
    ? Math.min(size, PUBLIC_PROPERTY_INDEX_MAX_PAGE_SIZE)
    : PUBLIC_PROPERTY_INDEX_PAGE_SIZE
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

function publicPropertyIndexItem(document: {
  id: string
  data: Record<string, unknown>
}): PublicPropertyIndexItem | null {
  const canonical = canonicalPropertyRoot({
    ...(document.data as Property),
    id: document.id,
  })
  if (!canonical || canonical.id !== document.id) return invalidSource()

  const name = text(canonical.identity.name)
  const unitCount = Number(canonical.identity.unit_count)
  if (!name || !Number.isInteger(unitCount) || unitCount < 0) {
    return invalidSource()
  }
  if (
    canonical.status !== 'active' ||
    canonical.publication_state !== 'published'
  )
    return null

  const imageUrl = text(canonical.identity.image_url)
  return {
    id: canonical.id,
    slug: canonical.slug,
    name,
    ...(imageUrl ? { image_url: imageUrl } : {}),
    property_type: canonical.identity.property_type,
    unit_count: unitCount,
  }
}

export async function readPublicPropertyIndex(input: {
  limit?: unknown
  cursor?: unknown
}): Promise<PublicPropertyIndexPage> {
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
      publicPropertyIndexItem({
        id: document.id,
        data: document.data() || {},
      })
    )
    .filter((item): item is PublicPropertyIndexItem => Boolean(item))
  const nextCursor =
    hasMore && pageDocs.length
      ? encodeCursor(pageDocs[pageDocs.length - 1]?.id || '')
      : ''

  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
  }
}
