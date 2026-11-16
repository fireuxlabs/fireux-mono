import type { LiveProjectionSources } from 'fireux-core/runtime/server/utils/live-projection-sources'
import { currentMenuAppId } from '../../../menu/server/ownership/app-scope'
import { readPlaceCurrencyCode } from 'fireux-places/runtime/place/utils/place-spine'
import { readPublishedPublicMenuSummary } from '../../../menu/server/index/browse-availability'
import { readKitchenOfferings } from '../offerings/read'
import { kitchenServiceSummary } from '../../utils/service-summary'
import { FieldPath } from 'firebase-admin/firestore'
import { createError } from 'h3'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { isFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import type {
  KitchenPublicSummary,
  KitchenDirectoryEntry,
} from '../../types/public'
import {
  readKitchenRelatedRecords,
  resolveKitchen,
  type KitchenReadScope,
} from '../identity/read.ts'

const KITCHEN_COLLECTION_LIMIT = 500
const text = (value: unknown) => String(value ?? '').trim()

export type ReadKitchensInput = {
  placeId?: unknown
  includeHidden?: boolean
}

/** Server-resolved Kitchens. Every Kitchen includes its canonical same-ID Place. */
export async function readKitchens(
  input: ReadKitchensInput = {},
  sources?: LiveProjectionSources
): Promise<KitchenDirectoryEntry[]> {
  const requestedPlaceId = text(input.placeId)
  if (requestedPlaceId && !isFirestoreDocumentId(requestedPlaceId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Place id is invalid.',
    })
  }

  const db = getRuntimeFirestore()
  const collection = db.collection('kitchens')
  const query = requestedPlaceId
    ? collection
        .where(FieldPath.documentId(), '==', requestedPlaceId)
        .orderBy(FieldPath.documentId())
        .limit(1)
    : collection.orderBy(FieldPath.documentId()).limit(KITCHEN_COLLECTION_LIMIT)

  sources?.watch(query, { authority: true })
  const snapshot = await query.get().catch(() => {
    throw createError({
      statusCode: 503,
      statusMessage: 'Kitchens could not be read.',
    })
  })
  const documents = snapshot.docs.map((document) => ({
    id: document.id,
    data: document.data() || {},
  }))
  const scope: KitchenReadScope = {}
  const related = await readKitchenRelatedRecords(
    db,
    documents,
    scope,
    sources
  ).catch(() => {
    throw createError({
      statusCode: 503,
      statusMessage: 'Kitchen Places could not be read.',
    })
  })

  const kitchens = documents
    .map((document) => resolveKitchen(document, related, scope))
    .filter((kitchen): kitchen is KitchenPublicSummary => Boolean(kitchen))
    .filter(
      (kitchen) => input.includeHidden === true || kitchen.identity.visibility
    )
  return Promise.all(
    kitchens.map(async (kitchen) => {
      const [offerings, menus] = await Promise.all([
        readKitchenOfferings(db, kitchen.id, undefined, sources),
        readPublishedPublicMenuSummary(
          db,
          kitchen.id,
          String(kitchen.place.timezone || ''),
          {
            appId: currentMenuAppId(),
            currencyCode: readPlaceCurrencyCode(kitchen.place) || undefined,
            showItemImages: kitchen.services.item_images === true,
            sources,
          }
        ),
      ])
      return {
        ...kitchen,
        service_labels: kitchenServiceSummary(offerings),
        has_published_menu:
          kitchen.identity.visibility && menus.hasPublishedMenu,
        ...(kitchen.identity.visibility && menus.special
          ? { special: menus.special }
          : {}),
      }
    })
  )
}
