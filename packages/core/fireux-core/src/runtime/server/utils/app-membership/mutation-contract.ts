import { createError } from 'h3'
import {
  FieldValue,
  type DocumentData,
  type UpdateData,
} from 'firebase-admin/firestore'
import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
} from '../../../models/operations/app-membership'
import type { AppUserRole } from '../../../models/core/user.model'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppAuthorityTargets,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
import type { GuardedServerTransaction } from '../firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from '../ids/path'

export type MutationContext = {
  actorUid: string
  appId: string
  developerUid: string
  appDatabaseId: string
  identityDatabaseId: string
  input: AppMembershipMutationInput
}

export type TransactionOutcome = AppMembershipMutationResult

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

export function stamp(actorUid: string) {
  return { at: FieldValue.serverTimestamp(), by: actorUid }
}

export function initialMembership(
  appId: string,
  actorUid: string,
  role: AppUserRole
) {
  return {
    role,
    is_premium: false,
    onboarding_status: 'pending',
    created: { at: FieldValue.serverTimestamp(), by: actorUid, app_id: appId },
    updated: stamp(actorUid),
  }
}

export function membershipRepairPatch(
  data: DocumentData,
  actorUid: string
): UpdateData<DocumentData> {
  const patch: UpdateData<DocumentData> = {}
  if (typeof data.is_premium !== 'boolean') patch.is_premium = false
  if (!['pending', 'completed', 'skipped'].includes(data.onboarding_status))
    patch.onboarding_status = 'pending'
  for (const field of ['console_enabled', 'profiles', 'notifications', 'console_targets'])
    if (field in data) patch[field] = FieldValue.delete()
  if (Object.keys(patch).length) patch.updated = stamp(actorUid)
  return patch
}

export function roleFrom(data: DocumentData | undefined): AppUserRole | null {
  return data?.role === 'admin' || data?.role === 'user' ? data.role : null
}

export function isAdminMembership(data: DocumentData | undefined) {
  return roleFrom(data) === 'admin'
}

export function requireAdmin(data: DocumentData | undefined) {
  if (!isAdminMembership(data)) forbidden(403, 'App admin access is required.')
}

export function requiredIdentityUserId(
  input: AppMembershipMutationInput,
  actorUid: string
) {
  if (input.action === 'ensure-self' || input.action === 'bootstrap-admin')
    return actorUid
  if (input.action === 'review-join' && input.approve)
    return requireFirestoreDocumentId(input.userId, 'User id')
  return ''
}

export function appGovernancePatch(actorUid: string) {
  return { updated: stamp(actorUid) }
}

export async function countTransactionAdmins(
  mutations: GuardedServerTransaction,
  appId: string
) {
  return (
    await mutations.query(serverAppUsersTarget(appId), {
      field: 'role', op: '==', value: 'admin', limit: 2,
    })
  ).length
}

export type AuthorityRevocation = {
  target: FirestoreMutationTarget<string, 'server'>
  id: string
}

export async function readTargetAuthorityRevocations(
  mutations: GuardedServerTransaction,
  appId: string,
  userId: string
) {
  const refs = new Map<string, AuthorityRevocation>()
  for (const { target } of serverAppAuthorityTargets(appId)) {
    for (const field of ['operator_ids', 'team_ids']) {
      const rows = await mutations.query(target, {
        field, op: 'array-contains', value: userId, limit: 100,
      })
      for (const row of rows) refs.set(`${target.key}:${row.id}`, { target, id: row.id })
      if (refs.size > MAX_TARGET_AUTHORITY_REVOCATIONS)
        forbidden(409, 'This member has too many retained target grants for an online removal.')
    }
  }
  return [...refs.values()]
}

export function revokedDriverLinks(data: DocumentData) {
  if (!Array.isArray(data.kitchen_links)) return []
  return data.kitchen_links.slice(0, 50).flatMap((value: unknown) =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? [{ ...(value as Record<string, unknown>), active: false }]
      : []
  )
}

export type MembershipTransactionState = {
  context: MutationContext
  mutations: GuardedServerTransaction
  appData: DocumentData
  actorMembershipExists: boolean
  actorMembership: DocumentData | undefined
}

export const runtimeUsersTarget = FIRESTORE_MUTATION_TARGETS.runtimeUsers
