import { FieldValue } from 'firebase-admin/firestore'
import {
  UserStorage,
  resolveUserAppConsoleTargetField,
} from '../../../models/core/user.model'
import { requireFirestoreDocumentId } from '../ids/path'
import {
  CONSOLE_COLLECTION_BY_FAMILY,
  appGovernancePatch,
  forbidden,
  initialMembership,
  isAdminMembership,
  normalizedConsoleTargets,
  requireIdentityUser,
  roleFrom,
  stamp,
  normalizeMembershipStringList,
  updateIdentityMirror,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './mutation-contract'

export async function handleSetConsoleTarget(
  state: MembershipTransactionState
): Promise<TransactionOutcome> {
  const {
    context,
    transaction,
    appDb,
    identityDb,
    sameDatabase,
    crossDatabaseUserVerified,
    appRef,
    appData,
    actorMembershipRef,
    actorMembershipBlockRef,
    actorMembershipSnapshot,
    actorMembership,
  } = state
  const { actorUid, appId, input } = context
  if (input.action !== 'set-console-target') {
    return forbidden(400, 'Set-console-target action is required.')
  }

  const family = String(input.family ?? '')
    .trim()
    .toLowerCase()
  const targetField = resolveUserAppConsoleTargetField(family)
  const targetCollection = CONSOLE_COLLECTION_BY_FAMILY[family]
  if (!targetField || !targetCollection) {
    forbidden(400, 'Console family is not supported.')
  }
  if (typeof input.enabled !== 'boolean') {
    forbidden(400, 'Console target state must be boolean.')
  }
  const targetId = requireFirestoreDocumentId(
    input.targetId,
    'Console target id'
  )
  const targetRef = appRef.collection(targetCollection).doc(targetId)
  const targetSnapshot = await transaction.get(targetRef)
  if (!targetSnapshot.exists) {
    forbidden(404, 'The console target does not exist in this App.')
  }
  const targetData = targetSnapshot.data() ?? {}
  const operatorIds = new Set([
    ...normalizeMembershipStringList(targetData.operator_ids),
    ...normalizeMembershipStringList(targetData.team_ids),
  ])
  if (!operatorIds.has(actorUid)) {
    forbidden(403, 'You are not an operator of this console target.')
  }

  const userRef = (sameDatabase ? appDb : identityDb)
    .collection(UserStorage.rootCollection)
    .doc(actorUid)
  await requireIdentityUser(transaction, userRef, crossDatabaseUserVerified)
  const created = !actorMembershipSnapshot.exists
  const membership = actorMembership ?? {}
  const targets = normalizedConsoleTargets(membership)
  const current = normalizeMembershipStringList(targets[targetField], 50)
  const next = input.enabled
    ? [...new Set([...current, targetId])]
    : current.filter((id) => id !== targetId)
  if (next.length > 50) {
    forbidden(409, 'This console target list is full.')
  }
  targets[targetField] = next
  const sparseTargets = Object.fromEntries(
    Object.entries(targets).filter(([, ids]) => ids.length > 0)
  )
  const hasTargets = Object.keys(sparseTargets).length > 0

  if (created) {
    const blockSnapshot = await transaction.get(actorMembershipBlockRef)
    if (blockSnapshot.exists) {
      forbidden(403, 'This App membership has been blocked.')
    }
    transaction.create(actorMembershipRef, {
      ...initialMembership(appId, actorUid, 'user'),
      console_enabled: hasTargets,
      ...(hasTargets ? { console_targets: sparseTargets } : {}),
    })
    transaction.update(
      appRef,
      appGovernancePatch(appData, actorUid, { countDelta: 1 })
    )
  } else {
    if (!roleFrom(membership)) {
      forbidden(409, 'The existing App membership has an invalid role.')
    }
    transaction.update(actorMembershipRef, {
      console_enabled: isAdminMembership(membership) || hasTargets,
      console_targets: hasTargets ? sparseTargets : FieldValue.delete(),
      updated: stamp(actorUid),
    })
  }
  if (sameDatabase) {
    updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
  }

  return {
    ok: true,
    action: input.action,
    appId,
    userId: actorUid,
    created,
    role: roleFrom(membership) ?? 'user',
    identityMirror: sameDatabase ? null : 'add',
  }
}
