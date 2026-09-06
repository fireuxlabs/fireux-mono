import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import {
  APP_USER_ONBOARDING_STATUSES,
  type AppUserOnboardingStatus,
} from 'fireux-core/runtime/app/models/app-user.model'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { createError, type H3Event } from 'h3'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  KitchenUserMembershipItem,
  KitchenUserMembershipsResponse,
  KitchenUserTeamAccess,
  KitchenUserTeamState,
} from '../../models/user-memberships.model.ts'
import { normalizeKitchen } from '../../utils/normalize-kitchen.ts'
import { readAppUserKitchenIds } from './user-kitchens.ts'

type StoredRecord = Record<string, unknown>

const text = (value: unknown) => String(value ?? '').trim()
const record = (value: unknown): StoredRecord =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as StoredRecord)
    : {}

function readOnboardingStatus(value: unknown): AppUserOnboardingStatus {
  return APP_USER_ONBOARDING_STATUSES.includes(value as AppUserOnboardingStatus)
    ? (value as AppUserOnboardingStatus)
    : 'pending'
}

function projectTeamAccess(
  exists: boolean,
  value: unknown,
  userId: string
): { team: KitchenUserTeamAccess | null; state: KitchenUserTeamState } {
  if (!exists) return { team: null, state: 'missing' }

  const source = record(value)
  if (text(source.user_id) !== userId) return { team: null, state: 'invalid' }
  return { team: { user_id: userId }, state: 'linked' }

}

export async function readKitchenUserMemberships(
  event: H3Event,
  input: { userId: string }
): Promise<KitchenUserMembershipsResponse> {
  const userId = requireFirestoreDocumentId(input.userId, 'User id')
  const { uid: actorUserId } = await requireFirebaseBearerUser(
    event,
    'Sign in to view User Kitchens.'
  )
  const appId = requireFirestoreDocumentId(
    useFireUXConfig(event).appId,
    'Runtime App id'
  )
  const db = getRuntimeFirestore()
  const actorRef = db.doc(`apps/${appId}/users/${actorUserId}`)
  const targetRef = db.doc(`apps/${appId}/users/${userId}`)
  const [actorSnapshot, targetSnapshot] =
    actorUserId === userId
      ? await targetRef.get().then((snapshot) => [snapshot, snapshot] as const)
      : await db.getAll(actorRef, targetRef)

  const actorAccess = resolveAppUserAccess(actorSnapshot.data())
  if (
    actorUserId !== userId &&
    (!actorAccess.hasMembership || !actorAccess.hasAdminAuthority)
  ) {
    throw createError({
      statusCode: 403,
      statusMessage:
        'App administrator access is required to view User Kitchens.',
    })
  }
  if (!targetSnapshot.exists) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User App membership not found.',
    })
  }

  const membership = targetSnapshot.data() || {}
  const targetAccess = resolveAppUserAccess(membership)
  if (!targetAccess.hasMembership || !targetAccess.role) {
    throw createError({
      statusCode: 409,
      statusMessage: 'User App membership is invalid.',
    })
  }

  const kitchenIds = readAppUserKitchenIds(membership)
  const storedPrimaryKitchenId = text(membership.primary_kitchen)
  const primaryKitchenId = kitchenIds.includes(storedPrimaryKitchenId)
    ? storedPrimaryKitchenId
    : kitchenIds.length === 1
      ? kitchenIds[0]!
      : ''
  const references = kitchenIds.flatMap((kitchenId) => [
    db.doc(`kitchens/${kitchenId}`),
    db.doc(`places/${kitchenId}`),
    db.doc(`kitchens/${kitchenId}/team/${userId}`),
  ])
  const snapshots = references.length ? await db.getAll(...references) : []
  const snapshotsByPath = new Map(
    snapshots.map((snapshot) => [snapshot.ref.path, snapshot])
  )
  const items: KitchenUserMembershipItem[] = kitchenIds.map((kitchenId) => {
    const kitchenSnapshot = snapshotsByPath.get(`kitchens/${kitchenId}`)
    const placeSnapshot = snapshotsByPath.get(`places/${kitchenId}`)
    const teamSnapshot = snapshotsByPath.get(
      `kitchens/${kitchenId}/team/${userId}`
    )
    const place = placeSnapshot?.exists
      ? normalizePlace(kitchenId, placeSnapshot.data())
      : null
    const kitchen = kitchenSnapshot?.exists
      ? normalizeKitchen(kitchenId, kitchenSnapshot.data(), place)
      : null
    const teamAccess = projectTeamAccess(
      Boolean(teamSnapshot?.exists),
      teamSnapshot?.data(),
      userId
    )
    return {
      kitchen_id: kitchenId,
      primary: kitchenId === primaryKitchenId,
      kitchen,
      place,
      team: teamAccess.team,
      team_state: teamAccess.state,
    }
  })

  items.sort((left, right) => Number(right.primary) - Number(left.primary))
  return {
    ok: true,
    user_id: userId,
    app_user: {
      role: targetAccess.role,
      subscription: targetAccess.subscription,
      onboarding_status: readOnboardingStatus(membership.onboarding_status),
      primary_kitchen_id: primaryKitchenId,
      kitchen_ids: kitchenIds,
    },
    items,
  }
}
