import { createError } from 'h3'
import {
  FieldValue,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type Transaction,
} from 'firebase-admin/firestore'
import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
  AppMembershipRole,
} from '../../../models/operations/app-membership'
import { AppUserStorage } from '../../../models/core/user.model'
import { requireFirestoreDocumentId } from '../ids/path'

export type MutationContext = {
  actorUid: string
  appId: string
  developerUid: string
  appDatabaseId: string
  identityDatabaseId: string
  input: AppMembershipMutationInput
}

export type MirrorMode = 'add' | 'remove' | null

export type TransactionOutcome = AppMembershipMutationResult & {
  identityMirror: MirrorMode
}

export const CONSOLE_COLLECTION_BY_FAMILY: Record<string, string> = {
  blank: 'blanks',
  kitchen: 'kitchens',
  portfolio: 'portfolios',
  property: 'properties',
  supplier: 'suppliers',
}

const MAX_TARGET_AUTHORITY_REVOCATIONS = 400

export function forbidden(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export function normalizeMembershipStringList(value: unknown, max = 500) {
  if (!Array.isArray(value)) return []
  const values = value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry) => entry && !entry.includes('/'))
    .slice(0, max)
  return [...new Set(values)]
}

export function membershipCount(data: DocumentData) {
  const count = Number(data?.derived?.user_count)
  return Number.isSafeInteger(count) && count >= 0 ? count : 0
}

export function stamp(actorUid: string) {
  return {
    at: FieldValue.serverTimestamp(),
    by: actorUid,
  }
}

export function initialMembership(
  appId: string,
  actorUid: string,
  role: AppMembershipRole
) {
  return {
    role,
    is_premium: false,
    console_enabled: role === 'admin',
    onboarding_status: 'pending',
    created: {
      at: FieldValue.serverTimestamp(),
      by: actorUid,
      app_id: appId,
    },
    updated: stamp(actorUid),
  }
}

export function membershipRepairPatch(data: DocumentData, actorUid: string) {
  const patch: Record<string, unknown> = {}
  if (typeof data.is_premium !== 'boolean') patch.is_premium = false
  if (typeof data.console_enabled !== 'boolean') patch.console_enabled = false
  if (
    data.onboarding_status !== 'pending' &&
    data.onboarding_status !== 'completed' &&
    data.onboarding_status !== 'skipped'
  ) {
    patch.onboarding_status = 'pending'
  }
  if ('profiles' in data && !Array.isArray(data.profiles)) {
    patch.profiles = FieldValue.delete()
  }
  if ('notifications' in data) patch.notifications = FieldValue.delete()

  if ('console_targets' in data) patch.console_targets = FieldValue.delete()

  if (Object.keys(patch).length) patch.updated = stamp(actorUid)
  return patch
}

export function roleFrom(
  data: DocumentData | undefined
): AppMembershipRole | null {
  return data?.role === 'admin' || data?.role === 'user' ? data.role : null
}

export function isAdminMembership(data: DocumentData | undefined) {
  return roleFrom(data) === 'admin'
}

export function requireAdmin(data: DocumentData | undefined) {
  if (!isAdminMembership(data)) {
    forbidden(403, 'App admin access is required.')
  }
}

export function requiredIdentityUserId(
  input: AppMembershipMutationInput,
  actorUid: string
) {
  if (
    input.action === 'ensure-self' ||
    input.action === 'bootstrap-admin'
  ) {
    return actorUid
  }
  if (input.action === 'review-join' && input.approve) {
    return requireFirestoreDocumentId(input.userId, 'User id')
  }
  return ''
}

export async function requireIdentityUser(
  transaction: Transaction,
  userRef: DocumentReference,
  alreadyVerified: boolean
) {
  if (alreadyVerified) return
  const snapshot = await transaction.get(userRef)
  if (!snapshot.exists) {
    forbidden(409, 'The public User record does not exist.')
  }
}

export function updateIdentityMirror(
  transaction: Transaction,
  userRef: DocumentReference,
  appId: string,
  actorUid: string,
  mode: Exclude<MirrorMode, null>
) {
  transaction.set(
    userRef,
    {
      app_ids:
        mode === 'add'
          ? FieldValue.arrayUnion(appId)
          : FieldValue.arrayRemove(appId),
      updated: stamp(actorUid),
    },
    { merge: true }
  )
}

export function appGovernancePatch(
  appData: DocumentData,
  actorUid: string,
  options: {
    countDelta?: number
  }
) {
  const patch: Record<string, unknown> = {
    updated: stamp(actorUid),
  }

  if (options.countDelta) {
    patch['derived.user_count'] = Math.max(
      0,
      membershipCount(appData) + options.countDelta
    )
  }

  return patch
}

export async function countTransactionAdmins(
  transaction: Transaction,
  appRef: DocumentReference
) {
  const snapshot = await transaction.get(
    appRef
      .collection(AppUserStorage.collection)
      .where('role', '==', 'admin')
      .limit(2)
  )
  return snapshot.size
}

export async function readTargetAuthorityRevocations(
  transaction: Transaction,
  appRef: DocumentReference,
  userId: string
) {
  const refs = new Map<string, DocumentReference>()
  const targetCollections = [
    ...new Set(Object.values(CONSOLE_COLLECTION_BY_FAMILY)),
  ]

  for (const collectionName of targetCollections) {
    for (const field of ['operator_ids', 'team_ids']) {
      const snapshot = await transaction.get(
        appRef
          .collection(collectionName)
          .where(field, 'array-contains', userId)
          .limit(MAX_TARGET_AUTHORITY_REVOCATIONS + 1)
      )
      for (const document of snapshot.docs)
        refs.set(document.ref.path, document.ref)
      if (refs.size > MAX_TARGET_AUTHORITY_REVOCATIONS) {
        forbidden(
          409,
          'This member has too many retained target grants for an online removal.'
        )
      }
    }
  }

  return [...refs.values()]
}

export function revokedDriverLinks(data: DocumentData) {
  if (!Array.isArray(data.kitchen_links)) return []
  return data.kitchen_links.slice(0, 50).flatMap((value: unknown) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return []
    return [{ ...(value as Record<string, unknown>), active: false }]
  })
}

export type MembershipTransactionState = {
  context: MutationContext
  transaction: Transaction
  appDb: Firestore
  identityDb: Firestore
  sameDatabase: boolean
  crossDatabaseUserVerified: boolean
  appRef: DocumentReference
  membershipCollection: CollectionReference
  appData: DocumentData
  actorMembershipRef: DocumentReference
  actorMembershipBlockRef: DocumentReference
  actorMembershipSnapshot: DocumentSnapshot
  actorMembership: DocumentData | undefined
}
