import {
  AppJoinRequestStorage,
  AppMembershipBlockStorage,
} from '../../../models/operations/app-membership'
import { UserStorage } from '../../../models/core/user.model'
import { requireFirestoreDocumentId } from '../ids/path'
import {
  appGovernancePatch,
  initialMembership,
  requireAdmin,
  requireIdentityUser,
  roleFrom,
  updateIdentityMirror,
  type MembershipTransactionState,
  type MirrorMode,
  type TransactionOutcome,
} from './mutation-contract'

export async function handleReviewJoin(
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
    membershipCollection,
    appData,
    actorMembership,
  } = state
  const { actorUid, appId, input } = context
  if (input.action !== 'review-join') {
    throw new Error('Review-join action is required.')
  }

  requireAdmin(actorMembership)
  const userId = requireFirestoreDocumentId(input.userId, 'User id')
  const targetMembershipRef = membershipCollection.doc(userId)
  const targetJoinRequestRef = appRef
    .collection(AppJoinRequestStorage.collection)
    .doc(userId)
  const targetMembershipBlockRef = appRef
    .collection(AppMembershipBlockStorage.collection)
    .doc(userId)
  const targetMembershipSnapshot = await transaction.get(targetMembershipRef)
  let created = false
  let mirror: MirrorMode = null
  
  if (input.approve) {
    const userRef = (sameDatabase ? appDb : identityDb)
      .collection(UserStorage.rootCollection)
      .doc(userId)
    await requireIdentityUser(
      transaction,
      userRef,
      crossDatabaseUserVerified
    )
    created = !targetMembershipSnapshot.exists
    if (created) {
      transaction.create(
        targetMembershipRef,
        initialMembership(appId, actorUid, 'user')
      )
    }
    if (sameDatabase) {
      updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
    } else {
      mirror = 'add'
    }
    transaction.delete(targetMembershipBlockRef)
  }
  
  transaction.update(
    appRef,
    appGovernancePatch(appData, actorUid, {
      countDelta: created ? 1 : 0,
    })
  )
  transaction.delete(targetJoinRequestRef)
  return {
    ok: true,
    action: input.action,
    appId,
    userId,
    created,
    role: input.approve ? roleFrom(targetMembershipSnapshot.data()) ?? 'user' : undefined,
    identityMirror: mirror,
  }
}
