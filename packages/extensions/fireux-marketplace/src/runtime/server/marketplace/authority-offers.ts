import { createError, type H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import type {
  MarketplaceOffer,
  MarketplaceOfferState,
  MarketplaceStore,
} from '../../models/marketplace.model'
import type {
  MarketplaceMutationResponse,
  MarketplaceOfferTransitionIntent,
} from '../../models/marketplace-api.model'
import {
  marketplaceDocumentId,
  normalizeMarketplaceOfferCreate,
  normalizeMarketplaceOfferPatch,
} from './validation'
import {
  assertCanManageStore,
  badRequest,
  canonicalOffer,
  canonicalStore,
  offersRef,
  requireMarketplaceMember,
  storeRef,
  text,
} from './authority-common'

export function assertOfferMethods(
  store: MarketplaceStore,
  offer: Pick<MarketplaceOffer, 'fulfilment_methods'>
) {
  if (
    offer.fulfilment_methods.some(
      (method) => !store.fulfilment_methods.includes(method)
    )
  ) {
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
  await current.db.runTransaction(async (transaction) => {
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
  await current.db.runTransaction(async (transaction) => {
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
    if (offer.state === 'published' && (!price || !fulfilmentMethods.length)) {
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

export const OFFER_TRANSITIONS: Record<
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
  await current.db.runTransaction(async (transaction) => {
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
