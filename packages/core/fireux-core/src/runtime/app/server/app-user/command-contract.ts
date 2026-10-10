import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
} from '../../models/app-membership'
import {
  isAppUserSubscription,
  isAppUserRole,
  type AppUserRole,
} from '../../models/app-user.model.ts'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import type { GuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from '../../../server/utils/ids/path'

export type MutationContext = {
  actorUid: string
  appId: string
  developerUid: string
  appDatabaseId: string
  identityDatabaseId: string
  input: AppMembershipMutationInput
}

export type TransactionOutcome = AppMembershipMutationResult

export function forbidden(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export function stamp(actorUid: string) {
  return { at: FieldValue.serverTimestamp(), by: actorUid }
}

export function initialMembership(actorUid: string, role: AppUserRole) {
  return {
    role,
    subscription: 'free',
    created: stamp(actorUid),
    updated: stamp(actorUid),
  }
}

export function requireCanonicalMembership(data: DocumentData) {
  if (!roleFrom(data)) forbidden(409, 'The App membership has an invalid role.')
  if (!isAppUserSubscription(data.subscription))
    forbidden(409, 'The App membership has an invalid subscription.')
}

export function roleFrom(data: DocumentData | undefined): AppUserRole | null {
  return isAppUserRole(data?.role) ? data.role : null
}

export function isAdminMembership(data: DocumentData | undefined) {
  const role = roleFrom(data)
  return role === 'admin' || role === 'dev'
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
  const memberships = serverAppUsersTarget(appId)
  const [admins, developers] = await Promise.all([
    mutations.query(memberships, {
      field: 'role',
      op: '==',
      value: 'admin',
      limit: 2,
    }),
    mutations.query(memberships, {
      field: 'role',
      op: '==',
      value: 'dev',
      limit: 2,
    }),
  ])
  return admins.length + developers.length
}

export type MembershipTransactionState = {
  context: MutationContext
  mutations: GuardedServerTransaction
  appData: DocumentData
  actorMembershipExists: boolean
  actorMembership: DocumentData | undefined
}

export const runtimeUsersTarget = FIRESTORE_MUTATION_TARGETS.runtimeUsers
