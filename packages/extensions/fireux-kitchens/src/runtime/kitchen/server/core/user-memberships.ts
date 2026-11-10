import type { DocumentSnapshot } from 'firebase-admin/firestore'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { resolveAppUserAccess } from 'fireux-core/runtime/app/utils/app-user-access'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { getRuntimeFirestore } from 'fireux-core/runtime/server/utils/getRuntimeFirestore'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { createError, type H3Event } from 'h3'
import { normalizePlace } from 'fireux-places/runtime/place/utils/normalize-place'
import type {
  KitchenUserMembershipItem,
  KitchenUserMembershipsResponse,
} from '../../models/user-memberships.model.ts'
import { readKitchenTeamAccountLink } from '../team/account-link'
import { normalizeKitchen } from '../../utils/normalize-kitchen.ts'
import {
  KITCHEN_ACCESS_COLLECTION_PATH,
  readKitchenAccessIds,
} from '../../utils/kitchen-access'

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

  const access = await db
    .collection(KITCHEN_ACCESS_COLLECTION_PATH)
    .doc(userId)
    .get()
  const kitchenIds = readKitchenAccessIds(access.data(), membership, appId)
  const references = kitchenIds.flatMap((kitchenId) => [
    db.doc(`kitchens/${kitchenId}`),
    db.doc(`places/${kitchenId}`),
  ])
  const roots: Promise<DocumentSnapshot[]> = references.length
    ? db.getAll(...references)
    : Promise.resolve([])
  const [snapshots, teamLinks] = await Promise.all([
    roots,
    Promise.all(
      kitchenIds.map((id) => readKitchenTeamAccountLink(db, id, userId))
    ),
  ])
  const snapshotsByPath = new Map(
    snapshots.map((snapshot) => [snapshot.ref.path, snapshot])
  )
  const items: KitchenUserMembershipItem[] = kitchenIds.map(
    (kitchenId, index) => {
      const kitchenSnapshot = snapshotsByPath.get(`kitchens/${kitchenId}`)
      const placeSnapshot = snapshotsByPath.get(`places/${kitchenId}`)
      const place = placeSnapshot?.exists
        ? normalizePlace(kitchenId, placeSnapshot.data())
        : null
      const kitchen = kitchenSnapshot?.exists
        ? normalizeKitchen(kitchenId, kitchenSnapshot.data(), place)
        : null
      const teamState = teamLinks[index]!.state
      return {
        kitchen_id: kitchenId,
        kitchen,
        place,
        team: teamState === 'linked' ? { user_id: userId } : null,
        team_state: teamState,
      }
    }
  )

  return {
    ok: true,
    user_id: userId,
    app_user: {
      role: targetAccess.role,
      subscription: targetAccess.subscription,
    },
    items,
  }
}
