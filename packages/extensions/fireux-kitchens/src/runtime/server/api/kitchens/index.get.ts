// Concurrent edit — 2026-07-20 22:37 CEST — Place-root authority pass: project published Kitchens through the concrete Place runtime model.
import { FieldPath, Filter } from 'firebase-admin/firestore'
import { createError, defineEventHandler, getQuery } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path.ts'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read.ts'
import { PlaceStorage } from 'fireux-places/runtime/models/place.model.ts'
import {
  PUBLIC_KITCHEN_INDEX_MAX_PAGE_SIZE,
  PUBLIC_KITCHEN_INDEX_PAGE_SIZE,
  type PublicKitchenIndexItem,
  type PublicKitchenIndexPage,
} from '../../../models/kitchen/kitchen-index.model.ts'
import {
  readKitchenAppScope,
  readKitchenIdentity,
  readKitchenVisibility,
} from '../../../utils/kitchen-spine.ts'
import { menuKitchenIdentity } from '../../menu/ownership/kitchen-scope.ts'

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

type KitchenDocument = {
  id: string
  data: Record<string, unknown>
}

async function hydrateKitchenIndex(
  db: ReturnType<typeof getRuntimeFirestore>,
  documents: KitchenDocument[]
) {
  const references = new Map<string, ReturnType<typeof db.doc>>()

  for (const document of documents) {
    const placeId = readRecordString(document.data, 'place_id')
    if (isFirestoreDocumentId(placeId)) {
      const placeRef = db.collection(PlaceStorage.collection).doc(placeId)
      references.set(placeRef.path, placeRef)
    }

    const appScope = readKitchenAppScope(document.data)
    if (
      (appScope.state === 'parent_app' || appScope.state === 'tenant_app') &&
      isFirestoreDocumentId(appScope.appId)
    ) {
      const appKitchenRef = db
        .collection(`apps/${appScope.appId}/kitchens`)
        .doc(document.id)
      references.set(appKitchenRef.path, appKitchenRef)
    }
  }

  if (!references.size) return new Map<string, Record<string, unknown>>()
  const snapshots = await db.getAll(...references.values())
  return new Map(
    snapshots
      .filter(snapshot => snapshot.exists)
      .map(snapshot => [snapshot.ref.path, snapshot.data() || {}])
  )
}

const isPublishedKitchen = (data: Record<string, unknown>) => {
  const visibility = readKitchenVisibility(data)
  return visibility.show === true && visibility.isTest !== true
}

function publicKitchenIndexItem(
  document: KitchenDocument,
  dataByPath: Map<string, Record<string, unknown>>
): PublicKitchenIndexItem | null {
  const rootData = document.data
  const placeId = readRecordString(rootData, 'place_id')
  if (!isFirestoreDocumentId(placeId)) return null

  const placeData = dataByPath.get(`${PlaceStorage.collection}/${placeId}`)
  if (!placeData) return null

  const appScope = readKitchenAppScope(rootData)
  const appData = (
    (appScope.state === 'parent_app' || appScope.state === 'tenant_app') &&
    isFirestoreDocumentId(appScope.appId)
  )
    ? dataByPath.get(`apps/${appScope.appId}/kitchens/${document.id}`) || {}
    : {}
  const identity = menuKitchenIdentity(rootData, appData, placeData)
  const appIdentity = readKitchenIdentity(appData)
  const rootIdentity = readKitchenIdentity(rootData)
  const name = text(identity.name)
  if (!name) return null

  const slug = readRecordString(rootData, 'slug')
  if (!slug) return null
  const shortName = readRecordString(placeData, 'short_name')
  const brandTagline = text(
    appIdentity.tagline ||
    rootIdentity.tagline ||
    readRecordString(placeData, 'brand_tagline')
  )
  const formattedAddress = readRecordString(placeData, 'formatted_address')
  const shortAddress = readRecordString(placeData, 'short_address')
  const imageUrl = text(identity.imageUrl || identity.logoImageUrl)

  return {
    id: document.id,
    name,
    slug,
    ...(shortName ? { short_name: shortName } : {}),
    ...(brandTagline ? { brand_tagline: brandTagline } : {}),
    ...(formattedAddress ? { formatted_address: formattedAddress } : {}),
    ...(shortAddress ? { short_address: shortAddress } : {}),
    ...(imageUrl ? { image_url: imageUrl } : {}),
    ...(imageUrl && identity.imageShade !== 'none'
      ? { image_shade: identity.imageShade }
      : {}),
  }
}

export default defineEventHandler(async (event): Promise<PublicKitchenIndexPage> => {
  const db = getRuntimeFirestore()
  const query = getQuery(event)
  const limit = pageSize(query.limit)
  const requestedCursor = text(query.cursor)
  const cursor = decodeCursor(requestedCursor)
  if (requestedCursor && !cursor) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Kitchen cursor is invalid.',
    })
  }

  let kitchenQuery = db
    .collection('kitchens')
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
  const documents = pageDocs.map(document => ({
    id: document.id,
    data: document.data() || {},
  })).filter(document => isPublishedKitchen(document.data))
  const dataByPath = await hydrateKitchenIndex(db, documents)
  const items = documents
    .map(document => publicKitchenIndexItem(document, dataByPath))
    .filter((item): item is PublicKitchenIndexItem => Boolean(item))
  const nextCursor = hasMore && pageDocs.length
    ? encodeCursor(pageDocs[pageDocs.length - 1]?.id || '')
    : ''

  return {
    items,
    ...(nextCursor ? { nextCursor } : {}),
  }
})
