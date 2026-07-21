// Concurrent edit — 2026-07-21 14:52 CEST — Werkbox User projection: serve bounded App-admin people data without exposing raw Users.
import { FieldPath } from 'firebase-admin/firestore'
import {
  createError,
  defineEventHandler,
  setResponseHeaders,
  type H3Event,
} from 'h3'
import { useFireUXConfig } from '../../../../composables/fireux/app/FireUXConfig'
import { AppStorage } from '../../../../models/core/app.model'
import { AppJoinRequestStorage } from '../../../../models/core/supporting/app-membership'
import { UserAppStorage, UserStorage } from '../../../../models/core/user.model'
import { requireFirebaseBearerUser } from '../../../utils/auth/bearer'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../utils/getRuntimeFirestore'
import type {
  AppAdminJoinRequestDto,
  AppAdminMemberDto,
  AppAdminPeopleResponse,
} from '../../../utils/public-projection/public-dto.types'
import { mapPublicUserIdentity } from '../../../utils/public-projection/public-user-identity'

const MAX_MEMBERS = 100
const MAX_JOIN_REQUESTS = 100

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

export default defineEventHandler(async (event: H3Event) => {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig()
  const appDb = getRuntimeFirestore()
  const identityDb = getRuntimeIdentityFirestore()
  const appRef = appDb.collection(AppStorage.collection).doc(appId)

  const actorMembership = await appRef
    .collection(UserAppStorage.collection)
    .doc(uid)
    .get()
  if (!actorMembership.exists || actorMembership.data()?.role !== 'admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'App admin access is required.',
    })
  }

  const [memberSnapshot, requestSnapshot] = await Promise.all([
    appRef
      .collection(UserAppStorage.collection)
      .orderBy(FieldPath.documentId())
      .limit(MAX_MEMBERS)
      .get(),
    appRef
      .collection(AppJoinRequestStorage.collection)
      .orderBy(FieldPath.documentId())
      .limit(MAX_JOIN_REQUESTS)
      .get(),
  ])

  const memberDocs = memberSnapshot.docs
  const requestDocs = requestSnapshot.docs
  const memberRoles = new Map<string, 'admin' | 'user'>()
  for (const document of memberDocs) {
    const role = document.data()?.role
    if (role !== 'admin' && role !== 'user') {
      conflict(`App member ${document.id} has an invalid role.`)
    }
    memberRoles.set(document.id, role)
  }

  const requestIds: string[] = []
  for (const document of requestDocs) {
    const userId = String(document.data()?.user_id || '').trim()
    if (!userId || userId !== document.id) {
      conflict(`Join request ${document.id} has an invalid User identity.`)
    }
    requestIds.push(userId)
  }

  const userIds = Array.from(
    new Set([...memberRoles.keys(), ...requestIds])
  )
  const userSnapshots = userIds.length
    ? await identityDb.getAll(
        ...userIds.map((userId) =>
          identityDb.collection(UserStorage.rootCollection).doc(userId)
        )
      )
    : []
  const usersById = new Map(
    userSnapshots.map((snapshot) => [
      snapshot.id,
      mapPublicUserIdentity(snapshot),
    ])
  )

  const members: AppAdminMemberDto[] = Array.from(memberRoles, ([id, role]) => ({
    id,
    role,
    user: usersById.get(id) ?? null,
  }))
  const joinRequests: AppAdminJoinRequestDto[] = requestIds.map((id) => ({
    id,
    user: usersById.get(id) ?? null,
  }))

  setResponseHeaders(event, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'private, no-store',
  })

  const response: AppAdminPeopleResponse = {
    ok: true,
    appId,
    members,
    joinRequests,
    truncated:
      memberSnapshot.size === MAX_MEMBERS ||
      requestSnapshot.size === MAX_JOIN_REQUESTS,
  }
  return response
})
