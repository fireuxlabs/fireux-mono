// Concurrent edit — 2026-07-20 11:52 CEST — Security spine: make App membership, role, premium, and console-target writes server-owned.
// Concurrent edit — 2026-07-20 14:10 CEST — Membership revocation pass: clear retained target and Driver grants so re-approval cannot resurrect authority.
// Concurrent edit — 2026-07-20 17:49 CEST — Repo Efficiency Pass 2 of 6: remove the parallel profile-index mutation route.

import { FieldValue, type Firestore } from 'firebase-admin/firestore'
import { AppStorage } from '../../../models/core/app.model'
import type {
  AppMembershipMutationResult,
} from '../../../models/operations/app-membership'
import {
  AppJoinRequestStorage,
  AppMembershipBlockStorage,
} from '../../../models/operations/app-membership'
import {
  AppUserStorage,
  UserStorage,
} from '../../../models/core/user.model'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../getRuntimeFirestore'
import {
  appGovernancePatch,
  countTransactionAdmins,
  forbidden,
  initialMembership,
  isAdminMembership,
  membershipRepairPatch,
  requiredIdentityUserId,
  requireIdentityUser,
  roleFrom,
  stamp,
  updateIdentityMirror,
  type MutationContext,
  type TransactionOutcome,
} from './mutation-contract'
import { handleRemoveMember } from './mutation-removal'
import { handleReviewJoin } from './mutation-review-join'
import { handleMembershipSettings } from './mutation-settings'


async function mutateInTransaction(
  context: MutationContext,
  appDb: Firestore,
  identityDb: Firestore,
  sameDatabase: boolean,
  crossDatabaseUserVerified: boolean
): Promise<TransactionOutcome> {
  const { actorUid, appId, developerUid, input } = context
  const appRef = appDb.collection(AppStorage.collection).doc(appId)
  const membershipCollection = appRef.collection(AppUserStorage.collection)

  return appDb.runTransaction(async (transaction) => {
    const appSnapshot = await transaction.get(appRef)
    if (!appSnapshot.exists) {
      forbidden(409, 'The runtime App record does not exist.')
    }
    const appData = appSnapshot.data() ?? {}
    const actorMembershipRef = membershipCollection.doc(actorUid)
    const actorJoinRequestRef = appRef
      .collection(AppJoinRequestStorage.collection)
      .doc(actorUid)
    const actorMembershipBlockRef = appRef
      .collection(AppMembershipBlockStorage.collection)
      .doc(actorUid)
    const actorMembershipSnapshot = await transaction.get(actorMembershipRef)
    const actorMembership = actorMembershipSnapshot.data()

    if (input.action === 'ensure-self') {
      const userRef = (sameDatabase ? appDb : identityDb)
        .collection(UserStorage.rootCollection)
        .doc(actorUid)
      await requireIdentityUser(
        transaction,
        userRef,
        crossDatabaseUserVerified
      )

      const created = !actorMembershipSnapshot.exists
      if (created) {
        const blockSnapshot = await transaction.get(actorMembershipBlockRef)
        if (blockSnapshot.exists) {
          forbidden(403, 'This App membership has been blocked.')
        }
        if (appData.self_join_enabled !== true) {
          forbidden(403, 'This App requires an approved join request.')
        }
        transaction.create(
          actorMembershipRef,
          initialMembership(appId, actorUid, 'user')
        )
        transaction.update(
          appRef,
          appGovernancePatch(appData, actorUid, { countDelta: 1 })
        )
      } else {
        if (!roleFrom(actorMembership)) {
          forbidden(409, 'The existing App membership has an invalid role.')
        }
        const repair = membershipRepairPatch(actorMembership ?? {}, actorUid)
        if (Object.keys(repair).length) {
          transaction.update(actorMembershipRef, repair)
        }
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
        role: created ? 'user' : roleFrom(actorMembership) ?? 'user',
        identityMirror: sameDatabase ? null : 'add',
      }
    }

    if (input.action === 'bootstrap-admin') {
      if (!developerUid || actorUid !== developerUid) {
        forbidden(403, 'Only the configured developer can bootstrap this App.')
      }
      const userRef = (sameDatabase ? appDb : identityDb)
        .collection(UserStorage.rootCollection)
        .doc(actorUid)
      await requireIdentityUser(
        transaction,
        userRef,
        crossDatabaseUserVerified
      )

      const actorIsAdmin = isAdminMembership(actorMembership)
      if (!actorIsAdmin && (await countTransactionAdmins(transaction, appRef)) > 0) {
        forbidden(409, 'This App already has an administrator.')
      }

      const created = !actorMembershipSnapshot.exists
      if (created) {
        transaction.create(
          actorMembershipRef,
          initialMembership(appId, actorUid, 'admin')
        )
      } else {
        transaction.update(actorMembershipRef, {
          ...membershipRepairPatch(actorMembership ?? {}, actorUid),
          role: 'admin',
          console_enabled: true,
          updated: stamp(actorUid),
        })
      }
      transaction.update(
        appRef,
        appGovernancePatch(appData, actorUid, {
          countDelta: created ? 1 : 0,
        })
      )
      if (sameDatabase) {
        updateIdentityMirror(transaction, userRef, appId, actorUid, 'add')
      }

      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created,
        role: 'admin',
        identityMirror: sameDatabase ? null : 'add',
      }
    }

    if (input.action === 'request-join') {
      if (actorMembershipSnapshot.exists) {
        return {
          ok: true,
          action: input.action,
          appId,
          userId: actorUid,
          requested: false,
          identityMirror: null,
        }
      }

      const blockSnapshot = await transaction.get(actorMembershipBlockRef)
      if (blockSnapshot.exists) {
        forbidden(403, 'This App membership has been blocked.')
      }

      transaction.set(actorJoinRequestRef, {
        user_id: actorUid,
        created: {
          at: FieldValue.serverTimestamp(),
          by: actorUid,
          app_id: appId,
        },
      })
      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        requested: true,
        identityMirror: null,
      }
    }

    if (input.action === 'review-join') {
      return handleReviewJoin({
        context,
        transaction,
        appDb,
        identityDb,
        sameDatabase,
        crossDatabaseUserVerified,
        appRef,
        membershipCollection,
        appData,
        actorMembershipRef,
        actorMembershipBlockRef,
        actorMembershipSnapshot,
        actorMembership,
      })
    }

    if (
      input.action === 'set-role' ||
      input.action === 'set-premium' ||
      input.action === 'set-onboarding-status'
    ) {
      return handleMembershipSettings({
        context,
        transaction,
        appDb,
        identityDb,
        sameDatabase,
        crossDatabaseUserVerified,
        appRef,
        membershipCollection,
        appData,
        actorMembershipRef,
        actorMembershipBlockRef,
        actorMembershipSnapshot,
        actorMembership,
      })
    }

    if (input.action === 'remove-member') {
      return handleRemoveMember({
        context,
        transaction,
        appDb,
        identityDb,
        sameDatabase,
        crossDatabaseUserVerified,
        appRef,
        membershipCollection,
        appData,
        actorMembershipRef,
        actorMembershipBlockRef,
        actorMembershipSnapshot,
        actorMembership,
      })
    }

    forbidden(400, 'Unsupported App membership action.')
  })
}

export async function mutateRuntimeAppMembership(
  context: MutationContext
): Promise<AppMembershipMutationResult> {
  const appDb = getRuntimeFirestore(context.appDatabaseId)
  const identityDb = getRuntimeIdentityFirestore(context.identityDatabaseId)
  const sameDatabase =
    String(context.appDatabaseId || '').trim() ===
    String(context.identityDatabaseId || context.appDatabaseId || '').trim()
  const requiredUserId = requiredIdentityUserId(context.input, context.actorUid)
  let crossDatabaseUserVerified = false

  if (!sameDatabase && requiredUserId) {
    const snapshot = await identityDb
      .collection(UserStorage.rootCollection)
      .doc(requiredUserId)
      .get()
    if (!snapshot.exists) {
      forbidden(409, 'The public User record does not exist.')
    }
    crossDatabaseUserVerified = true
  }

  const outcome = await mutateInTransaction(
    context,
    appDb,
    identityDb,
    sameDatabase,
    crossDatabaseUserVerified
  )

  if (!sameDatabase && outcome.identityMirror) {
    const userRef = identityDb
      .collection(UserStorage.rootCollection)
      .doc(outcome.userId)
    const userSnapshot = await userRef.get()
    if (userSnapshot.exists) {
      await userRef.set(
        {
          app_ids:
            outcome.identityMirror === 'add'
              ? FieldValue.arrayUnion(context.appId)
              : FieldValue.arrayRemove(context.appId),
          updated: stamp(context.actorUid),
        },
        { merge: true }
      )
    }
  }

  const { identityMirror: _identityMirror, ...result } = outcome
  return result
}
