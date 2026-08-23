import type {
  DocumentReference,
  DocumentSnapshot,
  Firestore,
} from 'firebase-admin/firestore'
import { createError, setHeader, setResponseHeaders, type H3Event } from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import {
  MarketplaceOfferStorage,
  MarketplaceOrderStorage,
  MarketplaceStoreStorage,
  MarketplaceStoreTeamStorage,
  type MarketplaceOffer,
  type MarketplaceOrder,
  type MarketplaceStore,
} from '../../models/marketplace.model.ts'
import { readMarketplaceServerScope } from './runtime'
import {
  canonicalMarketplaceOffer as validateOffer,
  canonicalMarketplaceOrder as validateOrder,
  canonicalMarketplaceStore as validateStore,
  MarketplaceValidationError,
} from './validation'

export const STORE_LIMIT = 100

export const OFFER_LIMIT = 100

export const ORDER_LIMIT = 100

export type MemberRole = 'user' | 'admin' | 'dev'

export type MarketplaceMemberContext = {
  uid: string
  role: MemberRole
  appId: string
  db: Firestore
  managedStoreIds: ReadonlySet<string>
}

export const text = (value: unknown) => String(value ?? '').trim()

export function badRequest<T>(work: () => T): T {
  try {
    return work()
  } catch (error) {
    if (error instanceof MarketplaceValidationError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw error
  }
}

export function invalidStored(label: string): never {
  throw createError({
    statusCode: 503,
    statusMessage: `${label} contains invalid stored data.`,
  })
}

export function canonicalStore(snapshot: DocumentSnapshot): MarketplaceStore {
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  try {
    return validateStore(snapshot.id, snapshot.data())
  } catch {
    return invalidStored('Store')
  }
}

export function canonicalGuardedStore(
  id: string,
  snapshot: { exists: boolean; data: Record<string, unknown> | undefined }
) {
  return canonicalStore({
    id,
    exists: snapshot.exists,
    data: () => snapshot.data,
  } as DocumentSnapshot)
}

export function canonicalOffer(snapshot: DocumentSnapshot): MarketplaceOffer {
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Offer not found.' })
  }
  try {
    return validateOffer(snapshot.id, snapshot.data())
  } catch {
    return invalidStored('Offer')
  }
}

export function canonicalOrder(snapshot: DocumentSnapshot): MarketplaceOrder {
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  try {
    return validateOrder(snapshot.id, snapshot.data())
  } catch {
    return invalidStored('Order')
  }
}

export function appRef(db: Firestore, appId: string) {
  return db.doc(`apps/${appId}`)
}

export function membershipRef(db: Firestore, appId: string, uid: string) {
  return db.doc(`apps/${appId}/users/${uid}`)
}

export function storesRef(db: Firestore, _appId: string) {
  return db.collection(MarketplaceStoreStorage.collection)
}

export function storeRef(db: Firestore, appId: string, storeId: string) {
  return storesRef(db, appId).doc(storeId)
}

export function storeTeamRef(store: DocumentReference) {
  return store.collection(MarketplaceStoreTeamStorage.collection)
}

export function storeAppId(store: MarketplaceStore) {
  return store.management.mode === 'app' ? store.management.app_id : ''
}

export function offersRef(store: DocumentReference) {
  return store.collection(MarketplaceOfferStorage.collection)
}

export function ordersRef(store: DocumentReference) {
  return store.collection(MarketplaceOrderStorage.collection)
}

export function validMemberRole(snapshot: DocumentSnapshot): MemberRole | '' {
  if (!snapshot.exists) return ''
  const role = text(snapshot.get('role'))
  return role === 'admin' || role === 'user' || role === 'dev' ? role : ''
}

export async function requireMarketplaceMember(
  event: H3Event
): Promise<MarketplaceMemberContext> {
  const { uid } = await requireFirebaseBearerUser(event)
  const scope = readMarketplaceServerScope(event)
  const db = getRuntimeFirestore(scope.databaseId)
  const [app, membership] = await db.getAll(
    appRef(db, scope.appId),
    membershipRef(db, scope.appId, uid)
  )
  const role = validMemberRole(membership)
  if (!app.exists || !role) {
    throw createError({
      statusCode: 403,
      statusMessage: 'A valid current App membership is required.',
    })
  }
  const teamMemberships = await db
    .collectionGroup(MarketplaceStoreTeamStorage.collection)
    .where('user_id', '==', uid)
    .limit(STORE_LIMIT + 1)
    .get()
  if (teamMemberships.size > STORE_LIMIT) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Store Team membership exceeds the supported limit.',
    })
  }
  const managedStoreIds = new Set(
    teamMemberships.docs.flatMap((member) => {
      const parent = member.ref.parent.parent
      const teamRole = text(member.get('role'))
      return parent?.parent.id === MarketplaceStoreStorage.collection &&
        text(member.get('status')) === 'active' &&
        (teamRole === 'owner' || teamRole === 'operator')
        ? [parent.id]
        : []
    })
  )
  return { uid, role, appId: scope.appId, db, managedStoreIds }
}

export async function requireMarketplaceAdmin(
  event: H3Event
): Promise<MarketplaceMemberContext> {
  const current = await requireMarketplaceMember(event)
  if (current.role !== 'admin' && current.role !== 'dev') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App administrator access is required.',
    })
  }
  return current
}

export function canManageStore(
  store: MarketplaceStore,
  current: MarketplaceMemberContext
) {
  return (
    current.role === 'admin' ||
    current.role === 'dev' ||
    current.managedStoreIds.has(store.id)
  )
}

export function assertCanManageStore(
  store: MarketplaceStore,
  current: MarketplaceMemberContext
) {
  if (storeAppId(store) !== current.appId || !canManageStore(store, current)) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
}

export function privateRead(event: H3Event) {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
}

export function cacheMarketplaceDirectoryRead(event: H3Event) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control':
      'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
  })
}

export function stampMillis(value: unknown): number {
  const at = (value as { at?: { toMillis?: () => number; seconds?: number } })
    ?.at
  if (typeof at?.toMillis === 'function') return at.toMillis()
  return typeof at?.seconds === 'number' ? at.seconds * 1000 : 0
}

export function sortRecent<T extends { updated: unknown; id: string }>(
  items: T[]
) {
  return items.sort(
    (left, right) =>
      stampMillis(right.updated) - stampMillis(left.updated) ||
      left.id.localeCompare(right.id)
  )
}

export async function readStoreOffers(
  ref: DocumentReference,
  publishedOnly = false
): Promise<MarketplaceOffer[]> {
  let query = offersRef(ref).limit(OFFER_LIMIT + 1)
  if (publishedOnly)
    query = offersRef(ref)
      .where('state', '==', 'published')
      .limit(OFFER_LIMIT + 1)
  const snapshot = await query.get()
  if (snapshot.size > OFFER_LIMIT) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Store has too many offers to project safely.',
    })
  }
  return snapshot.docs.map(canonicalOffer)
}
