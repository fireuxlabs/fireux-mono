import { FieldValue } from 'firebase-admin/firestore'
import {
  AppJoinRequestStorage,
  AppMembershipBlockStorage,
} from '../../../models/operations/app-membership'
import { UserStorage } from '../../../models/core/user.model'
import { requireFirestoreDocumentId } from '../ids/path'
import {
  appGovernancePatch,
  countTransactionAdmins,
  forbidden,
  isAdminMembership,
  readTargetAuthorityRevocations,
  requireAdmin,
  revokedDriverLinks,
  stamp,
  updateIdentityMirror,
  type MembershipTransactionState,
  type TransactionOutcome,
} from './mutation-contract'

export async function handleRemoveMember(
  state: MembershipTransactionState
): Promise<TransactionOutcome> {
  const {
    context,
    transaction,
    appDb,
    identityDb,
    sameDatabase,
    appRef,
    membershipCollection,
    appData,
    actorMembershipSnapshot,
    actorMembership,
  } = state
  const { actorUid, appId, input } = context
  if (input.action !== 'remove-member') {
    return forbidden(400, 'Remove-member action is required.')
  }

  const userId = requireFirestoreDocumentId(
    input.userId || actorUid,
    'User id'
  )
  if (userId !== actorUid) requireAdmin(actorMembership)
  const targetMembershipRef = membershipCollection.doc(userId)
  const targetMembershipSnapshot =
    userId === actorUid
      ? actorMembershipSnapshot
      : await transaction.get(targetMembershipRef)
  const targetMembership = targetMembershipSnapshot.data()
  if (!targetMembershipSnapshot.exists) {
    const userRef = (sameDatabase ? appDb : identityDb)
      .collection(UserStorage.rootCollection)
      .doc(userId)
    const driverRef = appRef.collection('drivers').doc(userId)
    const targetAuthorityRefs = await readTargetAuthorityRevocations(
      transaction,
      appRef,
      userId
    )
    const driverSnapshot = await transaction.get(driverRef)
    if (sameDatabase) {
      const userSnapshot = await transaction.get(userRef)
      if (userSnapshot.exists) {
        updateIdentityMirror(transaction, userRef, appId, actorUid, 'remove')
      }
    }
    transaction.delete(
      appRef.collection(AppJoinRequestStorage.collection).doc(userId)
    )
    for (const targetRef of targetAuthorityRefs) {
      transaction.update(targetRef, {
        operator_ids: FieldValue.arrayRemove(userId),
        team_ids: FieldValue.arrayRemove(userId),
        updated: stamp(actorUid),
      })
    }
    if (driverSnapshot.exists) {
      transaction.update(driverRef, {
        active_kitchen_ids: [],
        kitchen_links: revokedDriverLinks(driverSnapshot.data() ?? {}),
        updated: stamp(actorUid),
      })
    }
    if (userId !== actorUid) {
      transaction.set(
        appRef.collection(AppMembershipBlockStorage.collection).doc(userId),
        {
          user_id: userId,
          blocked: stamp(actorUid),
        }
      )
    }
    return {
      ok: true,
      action: input.action,
      appId,
      userId,
      removed: false,
      identityMirror: sameDatabase ? null : 'remove',
    }
  }
  if (
    isAdminMembership(targetMembership) &&
    (await countTransactionAdmins(transaction, appRef)) <= 1
  ) {
    forbidden(409, 'The final App administrator cannot leave or be removed.')
  }
  
  const userRef = (sameDatabase ? appDb : identityDb)
    .collection(UserStorage.rootCollection)
    .doc(userId)
  const driverRef = appRef.collection('drivers').doc(userId)
  const [targetAuthorityRefs, driverSnapshot] = await Promise.all([
    readTargetAuthorityRevocations(transaction, appRef, userId),
    transaction.get(driverRef),
  ])
  if (sameDatabase) {
    const userSnapshot = await transaction.get(userRef)
    if (userSnapshot.exists) {
      updateIdentityMirror(transaction, userRef, appId, actorUid, 'remove')
    }
  }
  transaction.delete(targetMembershipRef)
  transaction.delete(
    appRef.collection(AppJoinRequestStorage.collection).doc(userId)
  )
  for (const targetRef of targetAuthorityRefs) {
    transaction.update(targetRef, {
      operator_ids: FieldValue.arrayRemove(userId),
      team_ids: FieldValue.arrayRemove(userId),
      updated: stamp(actorUid),
    })
  }
  if (driverSnapshot.exists) {
    transaction.update(driverRef, {
      active_kitchen_ids: [],
      kitchen_links: revokedDriverLinks(driverSnapshot.data() ?? {}),
      updated: stamp(actorUid),
    })
  }
  if (userId !== actorUid) {
    transaction.set(
      appRef.collection(AppMembershipBlockStorage.collection).doc(userId),
      {
        user_id: userId,
        blocked: stamp(actorUid),
      }
    )
  }
  transaction.update(
    appRef,
    appGovernancePatch(appData, actorUid, {
      countDelta: -1,
    })
  )
  return {
    ok: true,
    action: input.action,
    appId,
    userId,
    removed: true,
    identityMirror: sameDatabase ? null : 'remove',
  }
}
