import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppMarketplaceStoresTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { MarketplaceStore } from '../../models/marketplace.model'
import type { MarketplaceMutationResponse } from '../../models/marketplace-api.model'
import {
  marketplaceDocumentId,
  normalizeMarketplaceStoreCreate,
  normalizeMarketplaceStorePatch,
} from './validation'
import {
  assertCanManageStore,
  badRequest,
  canonicalGuardedStore,
  canonicalStore,
  readStoreOffers,
  requireMarketplaceAdmin,
  requireMarketplaceMember,
  storeRef,
} from './authority-common'
import { assertOfferMethods } from './authority-offers'

export async function createMarketplaceStore(
  event: H3Event,
  input: unknown
): Promise<MarketplaceMutationResponse<MarketplaceStore>> {
  const current = await requireMarketplaceAdmin(event)
  const intent = badRequest(() => normalizeMarketplaceStoreCreate(input))
  const ref = storeRef(current.db, current.appId, intent.slug)
  const stores = serverAppMarketplaceStoresTarget(current.appId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const existing = await mutations.read(stores, intent.slug)
    if (existing.exists) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That Store slug is already in use.',
      })
    }
    mutations.create(stores, intent.slug, {
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
  const stores = serverAppMarketplaceStoresTarget(current.appId)
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
    publishedOffers.forEach((offer) =>
      assertOfferMethods(
        { ...existing, fulfilment_methods: patch.fulfilment_methods! },
        offer
      )
    )
  }
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const snapshot = await mutations.read(stores, storeId)
    const store = canonicalGuardedStore(storeId, snapshot)
    assertCanManageStore(store, current)
    if (store.publication_state === 'pending_review') {
      throw createError({
        statusCode: 409,
        statusMessage: 'A Store under review must be returned before editing.',
      })
    }
    mutations.update(stores, storeId, {
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
  const stores = serverAppMarketplaceStoresTarget(current.appId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const snapshot = await mutations.read(stores, storeId)
    const store = canonicalGuardedStore(storeId, snapshot)
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
    mutations.update(stores, storeId, {
      publication_state: 'pending_review',
      submitted_at: FieldValue.serverTimestamp(),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}
