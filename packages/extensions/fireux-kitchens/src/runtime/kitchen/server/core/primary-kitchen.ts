import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { AppUser } from 'fireux-core/runtime/app/models/app-user.model'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverTimestamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverAppUsersTarget,
  serverUserNotificationsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  ALL_FIRESTORE_MUTATION_VERBS,
  assertFirestoreMutationSegment,
  defineFirestoreMutationTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { readUserKitchenIdsInTransaction } from './user-kitchens.ts'

export const PRIMARY_KITCHEN_DOCUMENT = 'kitchen'

export type PrimaryKitchenPreference = {
  primary_kitchen_id: string
}

export function serverUserKitchenPreferenceTarget(userId: string) {
  const uid = assertFirestoreMutationSegment(userId, 'userId')
  return defineFirestoreMutationTarget({
    key: 'users.private.kitchen',
    lane: 'server',
    verbs: ALL_FIRESTORE_MUTATION_VERBS,
    database: { kind: 'runtime' },
    collectionPath: `users/${uid}/private`,
  })
}

export async function requestPrimaryKitchenChange(input: {
  appId: string
  requestedKitchenId: string
  uid: string
}) {
  const requestedKitchenId = assertFirestoreMutationSegment(
    input.requestedKitchenId,
    'requestedKitchenId'
  )
  const appUsers = serverAppUsersTarget(input.appId)
  const preference = serverUserKitchenPreferenceTarget(input.uid)

  return runGuardedServerTransaction(appUsers.database, async (transaction) => {
    const [membership, currentPreference, kitchenIds, admins] =
      await Promise.all([
        transaction.read<AppUser>(appUsers, input.uid),
        transaction.read<PrimaryKitchenPreference>(
          preference,
          PRIMARY_KITCHEN_DOCUMENT
        ),
        readUserKitchenIdsInTransaction(transaction, input.uid),
        transaction.query<AppUser>(appUsers, {
          field: 'role',
          op: '==',
          value: 'admin',
          limit: 32,
        }),
      ])

    if (!membership.exists) {
      throw createError({
        statusCode: 403,
        statusMessage: 'App membership is required.',
      })
    }
    if (membership.data?.subscription === 'business') {
      throw createError({
        statusCode: 409,
        statusMessage: 'Business users can switch Kitchens directly.',
      })
    }
    if (!kitchenIds.includes(requestedKitchenId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'The requested Kitchen is not available to this user.',
      })
    }

    const storedPrimary = String(
      currentPreference.data?.primary_kitchen_id || ''
    ).trim()
    const currentPrimary = kitchenIds.includes(storedPrimary)
      ? storedPrimary
      : kitchenIds.length === 1
        ? kitchenIds[0]!
        : ''
    if (requestedKitchenId === currentPrimary) {
      throw createError({
        statusCode: 409,
        statusMessage: 'That Kitchen is already primary.',
      })
    }

    const requestId = `primary-kitchen-${randomUUID()}`
    for (const admin of admins) {
      if (admin.id === input.uid) continue
      transaction.create(serverUserNotificationsTarget(admin.id), requestId, {
        message: `Primary Kitchen change requested by ${input.uid}: ${currentPrimary || 'none'} → ${requestedKitchenId}.`,
        scope: 'app',
        created: {
          at: serverTimestamp(),
          app_id: input.appId,
        },
        read: false,
      })
    }

    return {
      ok: true as const,
      requestedKitchenId,
      notified: admins.filter((admin) => admin.id !== input.uid).length,
    }
  })
}
