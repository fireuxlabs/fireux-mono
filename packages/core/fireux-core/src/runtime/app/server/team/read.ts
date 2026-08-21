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
  AppAdminJoinRequest,
  AppAdminMember,
  AppAdminPeopleResponse,
} from '../../models/app-context.model.ts'
import { readUserIdentitySummary } from '../../../user/server/identity/summary'

const MAX_MEMBERS = 100
const MAX_JOIN_REQUESTS = 100

function conflict(message: string): never {
  throw createError({ statusCode: 409, statusMessage: message })
}

export async function readAppTeam(event: H3Event) {
  const { uid } = await requireFirebaseBearerUser(event)
  const { appId } = useFireUXConfig()
  const appDb = getRuntimeFirestore()
  const identityDb = getRuntimeIdentityFirestore()
  const appRef = appDb.collection('apps').doc(appId)

  const actorMembership = await appRef
    .collection('users')
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
      .collection('users')
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

  const userIds = Array.from(new Set([...memberRoles.keys(), ...requestIds]))
  const userSnapshots = userIds.length
    ? await identityDb.getAll(
        ...userIds.map((userId) =>
          identityDb.collection('users').doc(userId)
        )
      )
    : []
  const usersById = new Map(
    userSnapshots.map((snapshot) => [
      snapshot.id,
      readUserIdentitySummary(snapshot),
    ])
  )

  const members: AppAdminMember[] = Array.from(memberRoles, ([id, role]) => ({
    id,
    role,
    user: usersById.get(id) ?? null,
  }))
  const joinRequests: AppAdminJoinRequest[] = requestIds.map((id) => ({
    id,
    user: usersById.get(id) ?? null,
  }))

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
}
