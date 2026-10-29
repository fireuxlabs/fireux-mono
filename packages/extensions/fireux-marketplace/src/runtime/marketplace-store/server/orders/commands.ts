import { createError, type H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  addFinancialMoney,
  multiplyFinancialMoney,
} from 'fireux-finance/runtime/utils/money'
import type {
  MarketplaceOrder,
  MarketplaceOrderStatus,
} from '../../models/marketplace.model.ts'
import type {
  MarketplaceMutationResponse,
  MarketplaceOrdersResponse,
  MarketplaceOrderTransitionIntent,
} from '../../models/marketplace-api.model.ts'
import {
  marketplaceDocumentId,
  normalizeMarketplaceOrderCreate,
} from '../core/validation'
import {
  ORDER_LIMIT,
  assertCanManageStore,
  badRequest,
  canManageStore,
  canonicalOffer,
  canonicalOrder,
  canonicalStore,
  offersRef,
  ordersRef,
  privateRead,
  requireMarketplaceMember,
  sortRecent,
  storeRef,
  storeAppId,
  text,
} from '../core/authority'

export async function createMarketplaceOrder(
  event: H3Event,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceOrder>> {
  const current = await requireMarketplaceMember(event)
  const intent = badRequest(() => normalizeMarketplaceOrderCreate(input))
  const parent = storeRef(current.db, current.appId, intent.store_id)
  const orderRef = ordersRef(parent).doc()
  const offerRefs = intent.lines.map((line) =>
    offersRef(parent).doc(line.offer_id)
  )
  await current.db.runTransaction(async (transaction) => {
    const snapshots = await transaction.getAll(parent, ...offerRefs)
    const store = canonicalStore(snapshots[0])
    if (
      storeAppId(store) !== current.appId ||
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
    const lines = intent.lines.map((requested, index) => {
      const offer = canonicalOffer(snapshots[index + 1])
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
      lines.map((line) => line.line_total),
      'Order total'
    )
    transaction.create(orderRef, {
      id: orderRef.id,
      record_type: 'marketplace-order',
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
    query = ordersRef(storeRef(current.db, current.appId, store.id))
      .where('store_id', '==', store.id)
      .limit(ORDER_LIMIT + 1)
  } else {
    query = current.db
      .collectionGroup('orders')
      .where('record_type', '==', 'marketplace-order')
      .where('app_id', '==', current.appId)
      .where('buyer_uid', '==', current.uid)
      .limit(ORDER_LIMIT + 1)
  }
  const snapshot = await query.get()
  const items = sortRecent(
    snapshot.docs.slice(0, ORDER_LIMIT).map(canonicalOrder)
  ).filter(
    (order) =>
      order.app_id === current.appId &&
      (view === 'seller' || order.buyer_uid === current.uid)
  )
  return { items, view, truncated: snapshot.size > ORDER_LIMIT }
}

export const SELLER_ORDER_TRANSITIONS: Record<
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
  const matches = await current.db
    .collectionGroup('orders')
    .where('record_type', '==', 'marketplace-order')
    .where('id', '==', orderId)
    .where('app_id', '==', current.appId)
    .limit(2)
    .get()
  if (matches.size !== 1) {
    throw createError({ statusCode: 404, statusMessage: 'Order not found.' })
  }
  const ref = matches.docs[0]!.ref
  await current.db.runTransaction(async (transaction) => {
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
