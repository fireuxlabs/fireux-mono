import type { AppUsersResponse } from '../../models/app-users.response'
// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: serve bounded App-admin people data without exposing raw Users.
import { FieldPath } from 'firebase-admin/firestore'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../../composables/config/FireUXConfig'
import { AppJoinRequestStorage } from '../../models/app-membership'
import { requireFirebaseBearerUser } from '../../../server/utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'
import type {
  AppUserJoinRequestSummary,
  AppUserSummary,
} from '../../models/app-user-summary.ts'
import {
  isAppUserSubscription,
  type AppUserRole,
  type AppUserSubscription,
} from '../../models/app-user.model.ts'
import { readUserIdentitySummary } from '../../../user/server/identity/summary'

const MAX_APP_USERS = 100
const MAX_JOIN_REQUESTS = 100

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

export async function readAppUsers(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig()
  const appDb = getRuntimeFirestore()
  const identityDb = getRuntimeIdentityFirestore()
  const appRef = appDb.collection('apps').doc(appId)

  const actorMembership = await appRef.collection('users').doc(uid).get()
  const actorRole = actorMembership.data()?.role
  if (
    !actorMembership.exists ||
    (actorRole !== 'admin' && actorRole !== 'dev')
  ) {
    throw createError({
      statusCode: 403,
      statusMessage: 'App admin access is required.',
    })
  }

  const [appUserSnapshot, requestSnapshot] = await Promise.all([
    appRef
      .collection('users')
      .orderBy(FieldPath.documentId())
      .limit(MAX_APP_USERS)
      .get(),
    appRef
      .collection(AppJoinRequestStorage.collection)
      .orderBy(FieldPath.documentId())
      .limit(MAX_JOIN_REQUESTS)
      .get(),
  ])

  const appUserDocs = appUserSnapshot.docs
  const requestDocs = requestSnapshot.docs
  const appUserRows = new Map<
    string,
    { role: AppUserRole; subscription: AppUserSubscription }
  >()
  for (const document of appUserDocs) {
    const data = document.data()
    const role = data?.role
    const subscription = data?.subscription
    if (role !== 'admin' && role !== 'user' && role !== 'dev') {
      conflict(`AppUser ${document.id} has an invalid role.`)
    }
    if (!isAppUserSubscription(subscription)) {
      conflict(`AppUser ${document.id} has an invalid subscription.`)
    }
    appUserRows.set(document.id, { role, subscription })
  }

  const requestIds: string[] = []
  for (const document of requestDocs) {
    const userId = String(document.data()?.user_id || '').trim()
    if (!userId || userId !== document.id) {
      conflict(`Join request ${document.id} has an invalid User identity.`)
    }
    requestIds.push(userId)
  }

  const userIds = Array.from(new Set([...appUserRows.keys(), ...requestIds]))
  const userSnapshots = userIds.length
    ? await identityDb.getAll(
        ...userIds.map((userId) => identityDb.collection('users').doc(userId))
      )
    : []
  const usersById = new Map(
    userSnapshots.map((snapshot) => [
      snapshot.id,
      readUserIdentitySummary(snapshot),
    ])
  )

  const appUsers: AppUserSummary[] = Array.from(
    appUserRows,
    ([id, membership]) => ({
      id,
      ...membership,
      user: usersById.get(id) ?? null,
    })
  )
  const joinRequests: AppUserJoinRequestSummary[] = requestIds.map((id) => ({
    id,
    user: usersById.get(id) ?? null,
  }))

  const response: AppUsersResponse = {
    ok: true,
    appId,
    appUsers,
    joinRequests,
    truncated:
      appUserSnapshot.size === MAX_APP_USERS ||
      requestSnapshot.size === MAX_JOIN_REQUESTS,
  }
  return response
}
