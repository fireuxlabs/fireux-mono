import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { FieldValue } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverMarketplaceStoresTarget, serverMarketplaceStoreTeamMembersTarget } from '../mutation-targets'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import type { MarketplaceStore } from '../../models/marketplace.model.ts'
import type {
  MarketplaceAdminStoresResponse,
  MarketplaceMutationResponse,
  MarketplaceStoreMemberIntent,
  MarketplaceStoreModerationIntent,
} from '../../models/marketplace-api.model.ts'
import { marketplaceDocumentId } from '../core/validation'
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
  storeAppId,
  storesRef,
  text,
} from '../core/authority'
import { assertOfferMethods } from '../offers/commands'
import { resolveTeamMemberInput } from 'fireux-core/runtime/workspace/server/team/members'

export async function listAdminMarketplaceStores(
  event: H3Event
): Promise<MarketplaceAdminStoresResponse> {
  privateRead(event)
  const current = await requireMarketplaceAdmin(event)
  const snapshot = await storesRef(current.db, current.appId)
    .where('management.app_id', '==', current.appId)
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
  const stores = serverMarketplaceStoresTarget
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
  const name = text(input?.name)
  const roleIds = input?.role_ids
  const action = input?.action
  if (
    !Array.isArray(roleIds) ||
    roleIds.some((roleId) => typeof roleId !== 'string' || !roleId.trim()) ||
    !['add', 'remove'].includes(action)
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Store member action is invalid.',
    })
  }
  const config = useFireUXConfig(event)
  const memberInput =
    action === 'add'
      ? await resolveTeamMemberInput({ name: name || uid, userId: uid })
      : null
  const ref = storeRef(current.db, current.appId, storeId)
  const stores = serverMarketplaceStoresTarget
  const team = serverMarketplaceStoreTeamMembersTarget(storeId)
  const memberships = serverAppUsersTarget(current.appId)
  await runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const [
      storeSnapshot,
      membershipSnapshot,
      memberSnapshot,
      actorMembership,
      teamMembers,
    ] = await Promise.all([
      mutations.read(stores, storeId),
      mutations.read(memberships, uid),
      mutations.read<Record<string, unknown>>(team, uid),
      mutations.read(memberships, current.uid),
      mutations.readAll<Record<string, unknown>>(team, 1000),
    ])
    const store = canonicalGuardedStore(storeId, storeSnapshot)
    if (storeAppId(store) !== current.appId) {
      throw createError({ statusCode: 404, statusMessage: 'Store not found.' })
    }
    if (
      !['admin', 'user', 'dev'].includes(text(membershipSnapshot.data?.role))
    ) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Store member must already belong to the current App.',
      })
    }
    if (action === 'add' && !memberSnapshot.exists) {
      const subscription = actorMembership.data?.subscription
      if (
        !isAppUserSubscription(subscription) ||
        !hasAppSubscriptionCapacity(
          config.subscriptionCapacity,
          'marketplace-store.team',
          subscription,
          teamMembers.length
        )
      ) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Your subscription has reached its Team member limit.',
        })
      }
    }
    if (action === 'remove') {
      if (memberSnapshot.exists) mutations.delete(team, uid)
    } else if (memberSnapshot.exists) {
      mutations.update(team, uid, {
        name: memberInput!.name,
        user_id: uid,
        role_ids: [...new Set(roleIds.map(text))],
      })
    } else {
      mutations.create(team, uid, {
        name: memberInput!.name,
        user_id: uid,
        role_ids: [...new Set(roleIds.map(text))],
      })
    }
    mutations.update(stores, storeId, {
      updated: serverAuditStamp({ by: current.uid }),
    })
  })
  return { ok: true, item: canonicalStore(await ref.get()) }
}
