import {
  FieldValue,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
} from 'firebase-admin/firestore'
import {
  createError,
  setHeader,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer.ts'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore.ts'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps.ts'
import {
  addFinancialMoney,
  multiplyFinancialMoney,
} from 'fireux-finance/runtime/utils/money.ts'
import {
  MarketplaceOfferStorage,
  MarketplaceOrderStorage,
  MarketplaceStoreStorage,
  type MarketplaceOffer,
  type MarketplaceOfferState,
  type MarketplaceOrder,
  type MarketplaceOrderStatus,
  type MarketplaceStore,
} from '../../models/marketplace.model'
import type {
  ManagedMarketplaceStoreResponse,
  ManagedMarketplaceStoresResponse,
  MarketplaceAdminStoresResponse,
  MarketplaceMutationResponse,
  MarketplaceOfferTransitionIntent,
  MarketplaceOrderTransitionIntent,
  MarketplaceOrdersResponse,
  MarketplaceStoreMemberIntent,
  MarketplaceStoreModerationIntent,
  PublicMarketplaceStore,
  PublicMarketplaceStoreListResponse,
  PublicMarketplaceStoreResponse,
} from '../../models/marketplace-api.model'
import { projectPublicMarketplaceStore } from './projection'
import { readMarketplaceServerScope } from './runtime'
import {
  canonicalMarketplaceOffer,
  canonicalMarketplaceOrder,
  canonicalMarketplaceStore,
  marketplaceDocumentId,
  MarketplaceValidationError,
  normalizeMarketplaceOfferCreate,
  normalizeMarketplaceOfferPatch,
  normalizeMarketplaceOrderCreate,
  normalizeMarketplaceStoreCreate,
  normalizeMarketplaceStorePatch,
} from './validation'

const STORE_LIMIT = 100
const OFFER_LIMIT = 100
const ORDER_LIMIT = 100

type MemberRole = 'user' | 'admin'

type MarketplaceMemberContext = {
  uid: string
  role: MemberRole
  appId: string
  db: Firestore
}

const text = (value: unknown) => String(value ?? '').trim()

function badRequest<T>(work: () => T): T {
  try {
    return work()
  } catch (error) {
    if (error instanceof MarketplaceValidationError) {
      throw createError({ statusCode: 400, statusMessage: error.message })
    }
    throw error
  }
}

function invalidStored(label: string): never {
  throw createError({
    statusCode: 503,
    statusMessage: `${label} contains invalid stored data.`,
  })
}

function canonicalStore(snapshot: DocumentSnapshot): MarketplaceStore {
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  try {
    return canonicalMarketplaceStore(snapshot.id, snapshot.data())
  } catch {
    return invalidStored('Store')
  }
}

function canonicalOffer(snapshot: DocumentSnapshot): MarketplaceOffer {
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Offer not found.' })
  }
  try {
    return canonicalMarketplaceOffer(snapshot.id, snapshot.data())
  } catch {
    return invalidStored('Offer')
  }
}

function canonicalOrder(snapshot: DocumentSnapshot): MarketplaceOrder {
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  try {
    return canonicalMarketplaceOrder(snapshot.id, snapshot.data())
  } catch {
    return invalidStored('Order')
  }
}

function appRef(db: Firestore, appId: string) {
  return db.doc(`apps/${appId}`)
}

function membershipRef(db: Firestore, appId: string, uid: string) {
  return db.doc(`apps/${appId}/users/${uid}`)
}

function storesRef(db: Firestore, appId: string) {
  return appRef(db, appId).collection(MarketplaceStoreStorage.collection)
}

function storeRef(db: Firestore, appId: string, storeId: string) {
  return storesRef(db, appId).doc(storeId)
}

function offersRef(store: DocumentReference) {
  return store.collection(MarketplaceOfferStorage.collection)
}

function ordersRef(db: Firestore, appId: string) {
  return appRef(db, appId).collection(MarketplaceOrderStorage.collection)
}

function validMemberRole(snapshot: DocumentSnapshot): MemberRole | '' {
  if (!snapshot.exists) return ''
  const role = text(snapshot.get('role'))
  return role === 'admin' || role === 'user' ? role : ''
}

async function requireMarketplaceMember(
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
  return { uid, role, appId: scope.appId, db }
}

async function requireMarketplaceAdmin(
  event: H3Event
): Promise<MarketplaceMemberContext> {
  const current = await requireMarketplaceMember(event)
  if (current.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Current App administrator access is required.',
    })
  }
  return current
}

function canManageStore(
  store: MarketplaceStore,
  current: MarketplaceMemberContext
) {
  return current.role === 'admin' ||
    store.owner_ids.includes(current.uid) ||
    store.editor_ids.includes(current.uid)
}

function assertCanManageStore(
  store: MarketplaceStore,
  current: MarketplaceMemberContext
) {
  if (store.app_id !== current.appId || !canManageStore(store, current)) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
}

function privateRead(event: H3Event) {
  setHeader(event, 'Cache-Control', 'private, no-store')
  setHeader(event, 'Vary', 'Authorization')
}

function publicRead(event: H3Event) {
  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'public, max-age=30, s-maxage=120, stale-while-revalidate=300',
  })
}

function stampMillis(value: unknown): number {
  const at = (value as { at?: { toMillis?: () => number; seconds?: number } })?.at
  if (typeof at?.toMillis === 'function') return at.toMillis()
  return typeof at?.seconds === 'number' ? at.seconds * 1000 : 0
}

function sortRecent<T extends { updated: unknown; id: string }>(items: T[]) {
  return items.sort((left, right) =>
    stampMillis(right.updated) - stampMillis(left.updated) ||
    left.id.localeCompare(right.id)
  )
}

async function readStoreOffers(
  ref: DocumentReference,
  publishedOnly = false
): Promise<MarketplaceOffer[]> {
  let query = offersRef(ref).limit(OFFER_LIMIT + 1)
  if (publishedOnly) query = offersRef(ref)
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

export async function listPublicMarketplaceStores(
  event: H3Event
): Promise<PublicMarketplaceStoreListResponse> {
  publicRead(event)
  const scope = readMarketplaceServerScope(event)
  const db = getRuntimeFirestore(scope.databaseId)
  const snapshot = await storesRef(db, scope.appId)
    .where('publication_state', '==', 'published')
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
    .map(store => projectPublicMarketplaceStore(store))
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
  publicRead(event)
  const scope = readMarketplaceServerScope(event)
  const slug = badRequest(() => marketplaceDocumentId(rawSlug, 'Store slug'))
  const db = getRuntimeFirestore(scope.databaseId)
  const ref = storeRef(db, scope.appId, slug)
  const snapshot = await ref.get()
  if (!snapshot.exists) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  const store = canonicalStore(snapshot)
  if (
    store.app_id !== scope.appId ||
    store.slug !== slug ||
    store.publication_state !== 'published'
  ) {
    throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
  }
  const projected = projectPublicMarketplaceStore(
    store,
    await readStoreOffers(ref, true)
  )
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
        .map(snapshot => [snapshot.id, snapshot])
    ).values()
  ).slice(0, STORE_LIMIT)
  const items = sortRecent(snapshots.map(canonicalStore))
    .filter(store => store.app_id === current.appId && canManageStore(store, current))
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

export async function createMarketplaceStore(
  event: H3Event,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceStore>> {
  const current = await requireMarketplaceAdmin(event)
  const intent = badRequest(() => normalizeMarketplaceStoreCreate(input))
  const ref = storeRef(current.db, current.appId, intent.slug)
  await current.db.runTransaction(async transaction => {
    const existing = await transaction.get(ref)
    if (existing.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That Store slug is already in use.',
      })
    }
    transaction.create(ref, {
      id: intent.slug,
      app_id: current.appId,
      ...intent,
      publication_state: 'draft',
      owner_ids: [],
      editor_ids: [],
      submitted_at: null,
      published_at: null,
      created: serverAuditStamp({
        by: current.uid,
        appId: current.appId,
      }),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}

export async function patchMarketplaceStore(
  event: H3Event,
  rawStoreId: unknown,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceStore>> {
  const current = await requireMarketplaceMember(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const patch = badRequest(() => normalizeMarketplaceStorePatch(input))
  const ref = storeRef(current.db, current.appId, storeId)
  if (patch.fulfilment_methods) {
    const existing = canonicalStore(await ref.get())
    assertCanManageStore(existing, current)
    if (!['draft', 'paused'].includes(existing.publication_state)) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Fulfilment methods can only change while a Store is draft or paused.',
      })
    }
    const publishedOffers = await readStoreOffers(ref, true)
    publishedOffers.forEach(offer =>
      assertOfferMethods(
        { ...existing, fulfilment_methods: patch.fulfilment_methods! },
        offer
      )
    )
  }
  await current.db.runTransaction(async transaction => {
    const store = canonicalStore(await transaction.get(ref))
    assertCanManageStore(store, current)
    if (store.publication_state === 'pending_review') {
      throw createError({
        statusCode: 409,
        statusMessage: 'A Store under review must be returned before editing.',
      })
    }
    transaction.update(ref, {
      ...patch,
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}

export async function submitMarketplaceStore(
  event: H3Event,
  rawStoreId: unknown
): Promise<MarketplaceMutationResponse<MarketplaceStore>> {
  const current = await requireMarketplaceMember(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const ref = storeRef(current.db, current.appId, storeId)
  await current.db.runTransaction(async transaction => {
    const store = canonicalStore(await transaction.get(ref))
    assertCanManageStore(store, current)
    if (store.publication_state !== 'draft') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Only a draft Store can be submitted.',
      })
    }
    if (!store.fulfilment_methods.length) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Choose collection or local delivery before submitting the Store.',
      })
    }
    if (!store.owner_ids.length) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Assign at least one existing App member as Store owner before review.',
      })
    }
    transaction.update(ref, {
      publication_state: 'pending_review',
      submitted_at: FieldValue.serverTimestamp(),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}

function assertOfferMethods(
  store: MarketplaceStore,
  offer: Pick<MarketplaceOffer, 'fulfilment_methods'>
) {
  if (offer.fulfilment_methods.some(
    method => !store.fulfilment_methods.includes(method)
  )) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Offer fulfilment must be supported by its Store.',
    })
  }
}

export async function createMarketplaceOffer(
  event: H3Event,
  rawStoreId: unknown,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceOffer>> {
  const current = await requireMarketplaceMember(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const intent = badRequest(() => normalizeMarketplaceOfferCreate(input))
  const parent = storeRef(current.db, current.appId, storeId)
  const offerRef = offersRef(parent).doc()
  await current.db.runTransaction(async transaction => {
    const store = canonicalStore(await transaction.get(parent))
    assertCanManageStore(store, current)
    assertOfferMethods(store, intent)
    transaction.create(offerRef, {
      id: offerRef.id,
      app_id: current.appId,
      store_id: store.id,
      ...intent,
      state: 'draft',
      created: serverAuditStamp({
        by: current.uid,
        appId: current.appId,
      }),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalOffer(await offerRef.get()) }
}

export async function patchMarketplaceOffer(
  event: H3Event,
  rawStoreId: unknown,
  rawOfferId: unknown,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceOffer>> {
  const current = await requireMarketplaceMember(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const offerId = badRequest(() =>
    marketplaceDocumentId(rawOfferId, 'Offer id')
  )
  const patch = badRequest(() => normalizeMarketplaceOfferPatch(input))
  const parent = storeRef(current.db, current.appId, storeId)
  const ref = offersRef(parent).doc(offerId)
  await current.db.runTransaction(async transaction => {
    const [storeSnapshot, offerSnapshot] = await transaction.getAll(parent, ref)
    const store = canonicalStore(storeSnapshot)
    const offer = canonicalOffer(offerSnapshot)
    assertCanManageStore(store, current)
    if (offer.store_id !== store.id || offer.app_id !== current.appId) {
      throw createError({ statusCode: 404, statusMessage: 'Offer not found.' })
    }
    if (offer.state === 'archived') {
      throw createError({
        statusCode: 409,
        statusMessage: 'An archived Offer cannot be edited.',
      })
    }
    const fulfilmentMethods =
      patch.fulfilment_methods ?? offer.fulfilment_methods
    const price = patch.price === undefined ? offer.price : patch.price
    assertOfferMethods(store, { fulfilment_methods: fulfilmentMethods })
    if (
      offer.state === 'published' &&
      (!price || !fulfilmentMethods.length)
    ) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'A published Offer must keep a fixed price and fulfilment method.',
      })
    }
    transaction.update(ref, {
      ...patch,
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalOffer(await ref.get()) }
}

const OFFER_TRANSITIONS: Record<
  MarketplaceOfferState,
  MarketplaceOfferState[]
> = {
  draft: ['published', 'archived'],
  published: ['unavailable'],
  unavailable: ['published', 'archived'],
  archived: [],
}

export async function transitionMarketplaceOffer(
  event: H3Event,
  rawStoreId: unknown,
  rawOfferId: unknown,
  input: MarketplaceOfferTransitionIntent
): Promise<MarketplaceMutationResponse<MarketplaceOffer>> {
  const current = await requireMarketplaceMember(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const offerId = badRequest(() =>
    marketplaceDocumentId(rawOfferId, 'Offer id')
  )
  const requested = text(input?.state) as MarketplaceOfferState
  const parent = storeRef(current.db, current.appId, storeId)
  const ref = offersRef(parent).doc(offerId)
  await current.db.runTransaction(async transaction => {
    const [storeSnapshot, offerSnapshot] = await transaction.getAll(parent, ref)
    const store = canonicalStore(storeSnapshot)
    const offer = canonicalOffer(offerSnapshot)
    assertCanManageStore(store, current)
    if (!OFFER_TRANSITIONS[offer.state]?.includes(requested)) {
      throw createError({
        statusCode: 409,
        statusMessage: `Offer cannot move from ${offer.state} to ${requested}.`,
      })
    }
    if (requested === 'published') {
      if (store.publication_state !== 'published') {
        throw createError({
          statusCode: 409,
          statusMessage: 'Store must be published before its offers.',
        })
      }
      if (!offer.price || offer.price.currency_code !== 'CHF') {
        throw createError({
          statusCode: 409,
          statusMessage: 'A fixed CHF price is required before publication.',
        })
      }
      if (!offer.fulfilment_methods.length) {
        throw createError({
          statusCode: 409,
          statusMessage:
            'Choose collection or local delivery before publishing the Offer.',
        })
      }
      assertOfferMethods(store, offer)
    }
    transaction.update(ref, {
      state: requested,
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalOffer(await ref.get()) }
}

export async function createMarketplaceOrder(
  event: H3Event,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceOrder>> {
  const current = await requireMarketplaceMember(event)
  const intent = badRequest(() => normalizeMarketplaceOrderCreate(input))
  const parent = storeRef(current.db, current.appId, intent.store_id)
  const orderRef = ordersRef(current.db, current.appId).doc()
  const offerRefs = intent.lines.map(line =>
    offersRef(parent).doc(line.offer_id)
  )
  await current.db.runTransaction(async transaction => {
    const snapshots = await transaction.getAll(parent, ...offerRefs)
    const store = canonicalStore(snapshots[0])
    if (
      store.app_id !== current.appId ||
      store.publication_state !== 'published'
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Store is not currently accepting order requests.',
      })
    }
    if (!store.fulfilment_methods.includes(intent.fulfilment_method)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Store does not support that fulfilment method.',
      })
    }
    const offers = snapshots.slice(1).map(canonicalOffer)
    const lines = offers.map((offer, index) => {
      const requested = intent.lines[index]
      if (
        offer.app_id !== current.appId ||
        offer.store_id !== store.id ||
        offer.state !== 'published' ||
        !offer.price ||
        !offer.fulfilment_methods.includes(intent.fulfilment_method)
      ) {
        throw createError({
          statusCode: 409,
          statusMessage: `${offer.title} is not available for this request.`,
        })
      }
      const lineTotal = multiplyFinancialMoney(
        offer.price,
        requested.quantity,
        'Order line total'
      )
      return {
        offer_id: offer.id,
        title: offer.title,
        unit_label: offer.unit_label,
        quantity: requested.quantity,
        unit_price: offer.price,
        line_total: lineTotal,
      }
    })
    const total = addFinancialMoney(
      lines.map(line => line.line_total),
      'Order total'
    )
    transaction.create(orderRef, {
      id: orderRef.id,
      app_id: current.appId,
      store_id: store.id,
      store_name: store.name,
      buyer_uid: current.uid,
      lines,
      total,
      fulfilment_method: intent.fulfilment_method,
      delivery_address:
        intent.fulfilment_method === 'local_delivery'
          ? intent.delivery_address || ''
          : '',
      buyer_note: intent.buyer_note || '',
      status: 'requested',
      created: serverAuditStamp({
        by: current.uid,
        appId: current.appId,
      }),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalOrder(await orderRef.get()) }
}

export async function listMarketplaceOrders(
  event: H3Event,
  viewInput: unknown,
  storeInput: unknown
): Promise<MarketplaceOrdersResponse> {
  privateRead(event)
  const current = await requireMarketplaceMember(event)
  const view = text(viewInput) === 'seller' ? 'seller' : 'buyer'
  let query
  if (view === 'seller') {
    const storeId = badRequest(() =>
      marketplaceDocumentId(storeInput, 'Store id')
    )
    const store = canonicalStore(
      await storeRef(current.db, current.appId, storeId).get()
    )
    assertCanManageStore(store, current)
    query = ordersRef(current.db, current.appId)
      .where('store_id', '==', store.id)
      .limit(ORDER_LIMIT + 1)
  } else {
    query = ordersRef(current.db, current.appId)
      .where('buyer_uid', '==', current.uid)
      .limit(ORDER_LIMIT + 1)
  }
  const snapshot = await query.get()
  const items = sortRecent(
    snapshot.docs.slice(0, ORDER_LIMIT).map(canonicalOrder)
  ).filter(order =>
    order.app_id === current.appId &&
    (view === 'seller' || order.buyer_uid === current.uid)
  )
  return { items, view, truncated: snapshot.size > ORDER_LIMIT }
}

const SELLER_ORDER_TRANSITIONS: Record<
  MarketplaceOrderStatus,
  MarketplaceOrderStatus[]
> = {
  requested: ['accepted', 'rejected', 'cancelled'],
  accepted: ['ready', 'cancelled'],
  ready: ['completed', 'cancelled'],
  completed: [],
  rejected: [],
  cancelled: [],
}

export async function transitionMarketplaceOrder(
  event: H3Event,
  rawOrderId: unknown,
  input: MarketplaceOrderTransitionIntent
): Promise<MarketplaceMutationResponse<MarketplaceOrder>> {
  const current = await requireMarketplaceMember(event)
  const orderId = badRequest(() =>
    marketplaceDocumentId(rawOrderId, 'Order id')
  )
  const requested = text(input?.status) as MarketplaceOrderStatus
  const ref = ordersRef(current.db, current.appId).doc(orderId)
  await current.db.runTransaction(async transaction => {
    const orderSnapshot = await transaction.get(ref)
    const order = canonicalOrder(orderSnapshot)
    const parent = storeRef(current.db, current.appId, order.store_id)
    const store = canonicalStore(await transaction.get(parent))
    const buyerCancellation =
      order.buyer_uid === current.uid &&
      order.status === 'requested' &&
      requested === 'cancelled'
    const sellerTransition =
      canManageStore(store, current) &&
      SELLER_ORDER_TRANSITIONS[order.status]?.includes(requested)
    if (!buyerCancellation && !sellerTransition) {
      throw createError({
        statusCode: 409,
        statusMessage: `Order cannot move from ${order.status} to ${requested}.`,
      })
    }
    transaction.update(ref, {
      status: requested,
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalOrder(await ref.get()) }
}

export async function listAdminMarketplaceStores(
  event: H3Event
): Promise<MarketplaceAdminStoresResponse> {
  privateRead(event)
  const current = await requireMarketplaceAdmin(event)
  const snapshot = await storesRef(current.db, current.appId)
    .limit(STORE_LIMIT + 1)
    .get()
  return {
    items: sortRecent(
      snapshot.docs.slice(0, STORE_LIMIT).map(canonicalStore)
    ),
    truncated: snapshot.size > STORE_LIMIT,
  }
}

const MODERATION_TRANSITIONS: Record<
  MarketplaceStoreModerationIntent['action'],
  { from: MarketplaceStore['publication_state']; to: MarketplaceStore['publication_state'] }
> = {
  approve: { from: 'pending_review', to: 'published' },
  return: { from: 'pending_review', to: 'draft' },
  pause: { from: 'published', to: 'paused' },
  resume: { from: 'paused', to: 'published' },
}

export async function moderateMarketplaceStore(
  event: H3Event,
  rawStoreId: unknown,
  input: MarketplaceStoreModerationIntent
): Promise<MarketplaceMutationResponse<MarketplaceStore>> {
  const current = await requireMarketplaceAdmin(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const transition = MODERATION_TRANSITIONS[text(input?.action) as keyof typeof MODERATION_TRANSITIONS]
  if (!transition) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Marketplace moderation action is invalid.',
    })
  }
  const ref = storeRef(current.db, current.appId, storeId)
  if (transition.to === 'published') {
    const store = canonicalStore(await ref.get())
    if (!store.fulfilment_methods.length) {
      throw createError({
        statusCode: 409,
        statusMessage:
          'Choose collection or local delivery before publishing the Store.',
      })
    }
    if (transition.from === 'paused') {
      const publishedOffers = await readStoreOffers(ref, true)
      publishedOffers.forEach(offer => assertOfferMethods(store, offer))
    }
  }
  await current.db.runTransaction(async transaction => {
    const store = canonicalStore(await transaction.get(ref))
    if (store.publication_state !== transition.from) {
      throw createError({
        statusCode: 409,
        statusMessage: `Store cannot be moderated from ${store.publication_state}.`,
      })
    }
    transaction.update(ref, {
      publication_state: transition.to,
      ...(transition.to === 'published'
        ? { published_at: FieldValue.serverTimestamp() }
        : {}),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}

export async function mutateMarketplaceStoreMember(
  event: H3Event,
  rawStoreId: unknown,
  input: MarketplaceStoreMemberIntent
): Promise<MarketplaceMutationResponse<MarketplaceStore>> {
  const current = await requireMarketplaceAdmin(event)
  const storeId = badRequest(() =>
    marketplaceDocumentId(rawStoreId, 'Store id')
  )
  const uid = badRequest(() => marketplaceDocumentId(input?.uid, 'User id'))
  const memberRole = input?.role
  const action = input?.action
  if (
    !['owner', 'editor'].includes(memberRole) ||
    !['add', 'remove'].includes(action)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Store member action is invalid.',
    })
  }
  const ref = storeRef(current.db, current.appId, storeId)
  const targetMembership = membershipRef(current.db, current.appId, uid)
  await current.db.runTransaction(async transaction => {
    const [storeSnapshot, membershipSnapshot] =
      await transaction.getAll(ref, targetMembership)
    const store = canonicalStore(storeSnapshot)
    if (!validMemberRole(membershipSnapshot)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Store member must already belong to the current App.',
      })
    }
    const owners = new Set(store.owner_ids)
    const editors = new Set(store.editor_ids)
    if (memberRole === 'owner') {
      if (action === 'add') {
        owners.add(uid)
        editors.delete(uid)
      } else {
        owners.delete(uid)
      }
    } else if (action === 'add') {
      if (owners.has(uid)) {
        if (owners.size === 1) {
          throw createError({
            statusCode: 409,
            statusMessage: 'A Store must retain at least one owner.',
          })
        }
        owners.delete(uid)
      }
      editors.add(uid)
    } else {
      editors.delete(uid)
    }
    if (
      (!owners.size && store.publication_state !== 'draft') ||
      owners.size > 5 ||
      editors.size > 10
    ) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Store membership limits would be violated.',
      })
    }
    transaction.update(ref, {
      owner_ids: Array.from(owners),
      editor_ids: Array.from(editors),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}
