import type { DocumentSnapshot, Query } from 'firebase-admin/firestore'
import { createError, getQuery, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/composables/fireux/app/FireUXConfig'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import type {
  ManagedMarketplaceStoreResponse,
  ManagedMarketplaceStoresResponse,
  PublicMarketplaceStore,
  PublicMarketplaceStoreListResponse,
  PublicMarketplaceStoreResponse,
} from '../../models/marketplace-api.model.ts'
import {
  projectMarketplaceStoreDirectoryPreview,
  projectMarketplaceStorePreview,
  projectPublicMarketplaceStore,
} from './projection'
import { readMarketplaceServerScope } from '../core/runtime'
import { marketplaceDocumentId } from '../core/validation'
import {
  STORE_LIMIT,
  assertCanManageStore,
  badRequest,
  canManageStore,
  canonicalStore,
  privateRead,
  publicRead,
  readStoreOffers,
  requireMarketplaceMember,
  sortRecent,
  storeRef,
  storesRef,
} from '../core/authority'

const text = (value: unknown) => String(value ?? '').trim()

async function requireMarketplaceDirectoryPreview(
  event: H3Event,
  db: ReturnType<typeof getRuntimeFirestore>,
  appId: string
) {
  const { uid } = await requireFirebaseBearerUser(
    event,
    'Sign in to preview unpublished marketplace shops.'
  )
  const { developerId } = useFireUXConfig()
  const isDeveloper = import.meta.dev && uid === text(developerId)
  const membership = await db.doc(`apps/${appId}/users/${uid}`).get()
  const isAdmin = membership.exists && text(membership.data()?.role) === 'admin'
  if (!isAdmin && !isDeveloper) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'Current App administrator access is required to preview unpublished marketplace shops.',
    })
  }
  privateRead(event)
}

export async function listPublicMarketplaceStores(
  event: H3Event
): Promise<PublicMarketplaceStoreListResponse> {
  const scope = readMarketplaceServerScope(event)
  const db = getRuntimeFirestore(scope.databaseId)
  const visibility = text(getQuery(event).visibility)
  if (visibility && visibility !== 'all' && visibility !== 'published') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Marketplace directory visibility is invalid.',
    })
  }
  const requestedAll = visibility === 'all'
  const requestedPublished = visibility === 'published'
  const includeAll = (import.meta.dev && !requestedPublished) || requestedAll
  if (requestedAll) {
    await requireMarketplaceDirectoryPreview(event, db, scope.appId)
  } else if (includeAll) {
    privateRead(event)
  } else {
    publicRead(event)
  }
  let directoryQuery: Query = storesRef(db, scope.appId)
  if (!includeAll) {
    directoryQuery = directoryQuery.where(
      'publication_state',
      '==',
      'published'
    )
  }
  const snapshot = await directoryQuery
    .limit(STORE_LIMIT + 1)
    .get()
    .catch(() => {
      throw createError({
        statusCode: 503,
        statusMessage: 'Marketplace directory could not be read.',
      })
    })
  const stores = snapshot.docs
    .slice(0, STORE_LIMIT)
    .map(canonicalStore)
    .map((store) =>
      includeAll
        ? projectMarketplaceStoreDirectoryPreview(store)
        : projectPublicMarketplaceStore(store)
    )
    .filter((store): store is PublicMarketplaceStore => Boolean(store))
    .sort((left, right) => left.name.localeCompare(right.name))
  return {
    items: stores,
    truncated: snapshot.size > STORE_LIMIT,
  }
}

export async function getPublicMarketplaceStore(
  event: H3Event,
  rawSlug: unknown
): Promise<PublicMarketplaceStoreResponse> {
  const scope = readMarketplaceServerScope(event)
  const slug = badRequest(() => marketplaceDocumentId(rawSlug, 'Store slug'))
  const db = getRuntimeFirestore(scope.databaseId)
  const visibility = text(getQuery(event).visibility)
  if (visibility && visibility !== 'all' && visibility !== 'published') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Marketplace Store visibility is invalid.',
    })
  }
  const requestedAll = visibility === 'all'
  const requestedPublished = visibility === 'published'
  const includeAll = (import.meta.dev && !requestedPublished) || requestedAll
  if (requestedAll) {
    await requireMarketplaceDirectoryPreview(event, db, scope.appId)
  } else if (includeAll) {
    privateRead(event)
  } else {
    publicRead(event)
  }
  const ref = storeRef(db, scope.appId, slug)
  const snapshot = await ref.get()
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  const store = canonicalStore(snapshot)
  if (
    store.app_id !== scope.appId ||
    store.slug !== slug ||
    (!includeAll && store.publication_state !== 'published')
  ) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  const projected = includeAll
    ? projectMarketplaceStorePreview(store, await readStoreOffers(ref))
    : projectPublicMarketplaceStore(store, await readStoreOffers(ref, true))
  if (!projected) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  return { store: projected }
}

export async function listManagedMarketplaceStores(
  event: H3Event
): Promise<ManagedMarketplaceStoresResponse> {
  privateRead(event)
  const current = await requireMarketplaceMember(event)
  const [owners, editors] = await Promise.all([
    storesRef(current.db, current.appId)
      .where('owner_ids', 'array-contains', current.uid)
      .limit(STORE_LIMIT + 1)
      .get(),
    storesRef(current.db, current.appId)
      .where('editor_ids', 'array-contains', current.uid)
      .limit(STORE_LIMIT + 1)
      .get(),
  ])
  const truncated = owners.size > STORE_LIMIT || editors.size > STORE_LIMIT
  const snapshots: DocumentSnapshot[] = Array.from(
    new Map(
      [...owners.docs, ...editors.docs]
        .slice(0, STORE_LIMIT * 2)
        .map((snapshot) => [snapshot.id, snapshot])
    ).values()
  ).slice(0, STORE_LIMIT)
  const items = sortRecent(snapshots.map(canonicalStore)).filter(
    (store) => store.app_id === current.appId && canManageStore(store, current)
  )
  return { items, role: current.role, truncated }
}

export async function getManagedMarketplaceStore(
  event: H3Event,
  rawStoreId: unknown
): Promise<ManagedMarketplaceStoreResponse> {
  privateRead(event)
  const current = await requireMarketplaceMember(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const ref = storeRef(current.db, current.appId, storeId)
  const store = canonicalStore(await ref.get())
  assertCanManageStore(store, current)
  return {
    store: {
      ...store,
      offers: sortRecent(await readStoreOffers(ref)),
    },
  }
}
