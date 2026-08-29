import { randomUUID } from 'node:crypto'
import { createError } from 'h3'
import type { AppUser } from 'fireux-core/runtime/app/models/app-user.model'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverTimestamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  serverAppUsersTarget,
  serverUserNotificationsTarget,
} from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { assertFirestoreMutationSegment } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { readAppUserKitchenIds } from './user-kitchens.ts'

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

  return runGuardedServerTransaction(appUsers.database, async (transaction) => {
    const [membership, admins] = await Promise.all([
      transaction.read<AppUser>(appUsers, input.uid),
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
      const kitchenIds = readAppUserKitchenIds(membership.data)
      if (!kitchenIds.includes(requestedKitchenId)) {
        throw createError({
          statusCode: 403,
          statusMessage: 'The requested Kitchen is not available to this user.',
        })
      }
      transaction.update(appUsers, input.uid, {
        primary_kitchen: requestedKitchenId,
      })
      return {
        ok: true as const,
        requestedKitchenId,
        updated: true as const,
        notified: 0,
      }
    }
    const kitchenIds = readAppUserKitchenIds(membership.data)
    if (!kitchenIds.includes(requestedKitchenId)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'The requested Kitchen is not available to this user.',
      })
    }

    const storedPrimary = String(membership.data?.primary_kitchen || '').trim()
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
