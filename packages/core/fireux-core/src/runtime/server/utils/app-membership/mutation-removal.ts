import {
  FieldValue,
  type DocumentData,
  type UpdateData,
} from 'firebase-admin/firestore'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppChildTarget,
  serverAppJoinRequestsTarget,
  serverAppMembershipBlocksTarget,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from '../ids/path'
import {
  appGovernancePatch,
  countTransactionAdmins,
  forbidden,
  isAdminMembership,
  readTargetAuthorityRevocations,
  requireAdmin,
  deactivateArrayObjects,
  stamp,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './mutation-contract'

export async function handleRemoveMember(
  state: MembershipTransactionState
): Promise<TransactionOutcome> {
  const { context, mutations, actorMembershipExists, actorMembership } = state
  const { actorUid, appId, input } = context
  if (input.action !== 'remove-member')
    return forbidden(400, 'Remove-member action is required.')
  const userId = requireFirestoreDocumentId(input.userId || actorUid, 'User id')
  if (userId !== actorUid) requireAdmin(actorMembership)

  const memberships = serverAppUsersTarget(appId)
  const target = userId === actorUid
    ? { exists: actorMembershipExists, data: actorMembership }
    : await mutations.read(memberships, userId)
  if (target.exists && isAdminMembership(target.data) &&
      (await countTransactionAdmins(mutations, appId)) <= 1)
    forbidden(409, 'The final App administrator cannot leave or be removed.')

  const joins = serverAppJoinRequestsTarget(appId)
  const blocks = serverAppMembershipBlocksTarget(appId)
  const cleanupTargets = context.membershipCleanupRegistry.map(registration => ({
    registration,
    target: serverAppChildTarget(
      appId,
      `apps.membership-cleanup.${registration.collection}`,
      registration.collection
    ),
  }))
  const [join, block, authority, cleanupRecords] = await Promise.all([
    mutations.read(joins, userId),
    mutations.read(blocks, userId),
    readTargetAuthorityRevocations(
      mutations,
      appId,
      userId,
      context.authorityCollections
    ),
    Promise.all(
      cleanupTargets.map(async entry => ({
        ...entry,
        record: await mutations.read(entry.target, userId),
      }))
    ),
  ])
  if (target.exists) mutations.delete(memberships, userId)
  if (join.exists) mutations.delete(joins, userId)
  for (const grant of authority)
    mutations.update(grant.target, grant.id, {
      operator_ids: FieldValue.arrayRemove(userId),
      team_ids: FieldValue.arrayRemove(userId),
      updated: stamp(actorUid),
    })
  for (const { registration, target: cleanupTarget, record } of cleanupRecords) {
    if (!record.exists) continue
    const patch: UpdateData<DocumentData> = { updated: stamp(actorUid) }
    for (const field of registration.clearArrayFields || []) patch[field] = []
    for (const field of registration.deactivateArrayObjectFields || []) {
      patch[field] = deactivateArrayObjects(record.data?.[field])
    }
    mutations.update(cleanupTarget, userId, patch)
  }
  if (userId !== actorUid) {
    const payload = { user_id: userId, blocked: stamp(actorUid) }
    if (block.exists) mutations.update(blocks, userId, payload)
    else mutations.create(blocks, userId, payload)
  }
  if (target.exists)
    mutations.update(FIRESTORE_MUTATION_TARGETS.runtimeApps, appId,
      appGovernancePatch(actorUid))
  return { ok: true, action: input.action, appId, userId, removed: target.exists }
}
