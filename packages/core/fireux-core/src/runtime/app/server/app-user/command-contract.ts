import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type {
  AppMembershipMutationInput,
  AppMembershipMutationResult,
} from '../../models/app-membership'
import {
  isAppUserSubscription,
  type AppUserRole,
} from '../../models/app-user.model.ts'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppAuthorityTargets,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import type { FirestoreMutationTarget } from '../../../types/firestore-mutations'
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

export function initialMembership(actorUid: string, role: AppUserRole) {
  return {
    role,
    subscription: 'free',
    onboarding_status: 'pending',
    created: stamp(actorUid),
    updated: stamp(actorUid),
  }
}

function requireCanonicalRelationship(
  data: DocumentData,
  idsField: string,
  primaryField: string
) {
  const hasIds = Object.hasOwn(data, idsField)
  const hasPrimary = Object.hasOwn(data, primaryField)
  if (hasIds !== hasPrimary) {
    forbidden(
      409,
      `The App membership has an incomplete ${idsField} relationship.`
    )
  }
  if (!hasIds) return

  const storedIds = data[idsField]
  const normalizedIds = normalizeMembershipStringList(storedIds)
  if (
    !Array.isArray(storedIds) ||
    storedIds.length > 500 ||
    normalizedIds.length !== storedIds.length ||
    storedIds.some(
      (entry: unknown, index: number) => entry !== normalizedIds[index]
    )
  ) {
    forbidden(
      409,
      `The App membership has an invalid ${idsField} relationship.`
    )
  }

  const storedPrimary = data[primaryField]
  if (
    typeof storedPrimary !== 'string' ||
    storedPrimary !== storedPrimary.trim() ||
    storedPrimary.includes('/') ||
    (storedPrimary !== '' && !storedIds.includes(storedPrimary))
  ) {
    forbidden(
      409,
      `The App membership has an invalid ${primaryField} relationship.`
    )
  }
}

export function requireCanonicalMembership(data: DocumentData) {
  if (!roleFrom(data)) forbidden(409, 'The App membership has an invalid role.')
  if (!isAppUserSubscription(data.subscription))
    forbidden(409, 'The App membership has an invalid subscription.')
  if (!['pending', 'completed', 'skipped'].includes(data.onboarding_status))
    forbidden(409, 'The App membership has an invalid onboarding status.')
  for (const [idsField, primaryField] of [
    ['kitchens', 'primary_kitchen'],
    ['projects', 'primary_project'],
    ['properties', 'primary_property'],
    ['portfolios', 'primary_portfolio'],
    ['suppliers', 'primary_supplier'],
    ['blanks', 'primary_blank'],
  ] as const) {
    requireCanonicalRelationship(data, idsField, primaryField)
  }
}

export function roleFrom(data: DocumentData | undefined): AppUserRole | null {
  return data?.role === 'admin' || data?.role === 'user' || data?.role === 'dev'
    ? data.role
    : null
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
        field,
        op: 'array-contains',
        value: userId,
        limit: 100,
      })
      for (const row of rows)
        refs.set(`${target.key}:${row.id}`, { target, id: row.id })
      if (refs.size > MAX_TARGET_AUTHORITY_REVOCATIONS)
        forbidden(
          409,
          'This member has too many retained target grants for an online removal.'
        )
    }
  }
  return [...refs.values()]
}

export function revokedDriverLinks(data: DocumentData) {
  if (!Array.isArray(data.kitchen_links)) return []
  return data.kitchen_links
    .slice(0, 50)
    .flatMap((value: unknown) =>
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
