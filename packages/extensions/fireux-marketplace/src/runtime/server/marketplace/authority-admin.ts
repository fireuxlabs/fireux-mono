import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  serverAppMarketplaceStoresTarget,
  serverAppUsersTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import type { MarketplaceStore } from '../../models/marketplace.model'
import type {
  MarketplaceAdminStoresResponse,
  MarketplaceMutationResponse,
  MarketplaceStoreMemberIntent,
  MarketplaceStoreModerationIntent,
} from '../../models/marketplace-api.model'
import { marketplaceDocumentId } from './validation'
import {
  STORE_LIMIT,
  badRequest,
  canonicalStore,
  canonicalGuardedStore,
  privateRead,
  readStoreOffers,
  requireMarketplaceAdmin,
  sortRecent,
  storeRef,
  storesRef,
  text,
} from './authority-common'
import { assertOfferMethods } from './authority-offers'

export async function listAdminMarketplaceStores(
  event: H3Event
): Promise<MarketplaceAdminStoresResponse> {
  privateRead(event)
  const current = await requireMarketplaceAdmin(event)
  const snapshot = await storesRef(current.db, current.appId)
    .limit(STORE_LIMIT + 1)
    .get()
  return {
    items: sortRecent(snapshot.docs.slice(0, STORE_LIMIT).map(canonicalStore)),
    truncated: snapshot.size > STORE_LIMIT,
  }
}

export const MODERATION_TRANSITIONS: Record<
  MarketplaceStoreModerationIntent['action'],
  {
    from: MarketplaceStore['publication_state']
    to: MarketplaceStore['publication_state']
  }
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
  const transition =
    MODERATION_TRANSITIONS[
      text(input?.action) as keyof typeof MODERATION_TRANSITIONS
    ]
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
      publishedOffers.forEach((offer) => assertOfferMethods(store, offer))
    }
  }
  const stores = serverAppMarketplaceStoresTarget(current.appId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const snapshot = await mutations.read(stores, storeId)
    const store = canonicalGuardedStore(storeId, snapshot)
    if (store.publication_state !== transition.from) {
      throw createError({
        statusCode: 409,
        statusMessage: `Store cannot be moderated from ${store.publication_state}.`,
      })
    }
    mutations.update(stores, storeId, {
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
  const stores = serverAppMarketplaceStoresTarget(current.appId)
  const memberships = serverAppUsersTarget(current.appId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [storeSnapshot, membershipSnapshot] = await Promise.all([
      mutations.read(stores, storeId),
      mutations.read(memberships, uid),
    ])
    const store = canonicalGuardedStore(storeId, storeSnapshot)
    if (!['admin', 'user'].includes(text(membershipSnapshot.data?.role))) {
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
    mutations.update(stores, storeId, {
      owner_ids: Array.from(owners),
      editor_ids: Array.from(editors),
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}
