import { FieldValue } from 'firebase-admin/firestore'
import type { AppMembershipMutationResult } from '../../models/app-membership'
import {
  FIRESTORE_MUTATION_TARGETS,
  serverAppJoinRequestsTarget,
  serverAppMembershipBlocksTarget,
  serverAppUsersTarget,
} from '../../../utils/firestore-mutations/targets'
import { getRuntimeIdentityFirestore } from '../../../server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import {
  appGovernancePatch,
  countTransactionAdmins,
  forbidden,
  initialMembership,
  isAdminMembership,
  requireCanonicalMembership,
  requiredIdentityUserId,
  roleFrom,
  stamp,
  type MutationContext,
  type TransactionOutcome,
} from './mutation-contract'
import { handleRemoveMember } from './mutation-removal'
import { handleReviewJoin } from './mutation-review-join'
import { handleMembershipSettings } from './mutation-settings'

async function mutateInTransaction(
  context: MutationContext,
  crossDatabaseUserVerified: boolean
): Promise<TransactionOutcome> {
  const { actorUid, appId, developerUid, input } = context
  const apps = FIRESTORE_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(appId)
  const joinRequests = serverAppJoinRequestsTarget(appId)
  const blocks = serverAppMembershipBlocksTarget(appId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const app = await mutations.read(apps, appId)
    if (!app.exists) forbidden(409, 'The runtime App record does not exist.')
    const appData = app.data ?? {}
    const actorMembershipSnapshot = await mutations.read(memberships, actorUid)
    const actorMembership = actorMembershipSnapshot.data

    if (input.action === 'ensure-self') {
      if (!crossDatabaseUserVerified) {
        const user = await mutations.read(
          FIRESTORE_MUTATION_TARGETS.runtimeUsers,
          actorUid
        )
        if (!user.exists)
          forbidden(409, 'The public User record does not exist.')
      }
      const created = !actorMembershipSnapshot.exists
      if (created) {
        const block = await mutations.read(blocks, actorUid)
        if (block.exists)
          forbidden(403, 'This App membership has been blocked.')
        if (appData.self_join_enabled !== true)
          forbidden(403, 'This App requires an approved join request.')
        mutations.create(
          memberships,
          actorUid,
          initialMembership(actorUid, 'user')
        )
        mutations.update(apps, appId, appGovernancePatch(actorUid))
      } else {
        requireCanonicalMembership(actorMembership ?? {})
      }
      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created,
        role: created ? 'user' : (roleFrom(actorMembership) ?? 'user'),
      }
    }

    if (input.action === 'bootstrap-admin') {
      if (!developerUid || actorUid !== developerUid)
        forbidden(403, 'Only the configured developer can bootstrap this App.')
      if (!crossDatabaseUserVerified) {
        const user = await mutations.read(
          FIRESTORE_MUTATION_TARGETS.runtimeUsers,
          actorUid
        )
        if (!user.exists)
          forbidden(409, 'The public User record does not exist.')
      }
      if (
        !isAdminMembership(actorMembership) &&
        (await countTransactionAdmins(mutations, appId)) > 0
      )
        forbidden(409, 'This App already has an administrator.')
      const created = !actorMembershipSnapshot.exists
      if (created)
        mutations.create(
          memberships,
          actorUid,
          initialMembership(actorUid, 'admin')
        )
      else {
        requireCanonicalMembership(actorMembership ?? {})
        mutations.update(memberships, actorUid, {
          role: 'admin',
          updated: stamp(actorUid),
        })
      }
      mutations.update(apps, appId, appGovernancePatch(actorUid))
      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created,
        role: 'admin',
      }
    }

    if (input.action === 'request-join') {
      if (actorMembershipSnapshot.exists)
        return {
          ok: true,
          action: input.action,
          appId,
          userId: actorUid,
          requested: false,
        }
      if ((await mutations.read(blocks, actorUid)).exists)
        forbidden(403, 'This App membership has been blocked.')
      const existingRequest = await mutations.read(joinRequests, actorUid)
      if (!existingRequest.exists)
        mutations.create(joinRequests, actorUid, {
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
        requested: !existingRequest.exists,
      }
    }

    const state = {
      context,
      mutations,
      appData,
      actorMembershipExists: actorMembershipSnapshot.exists,
      actorMembership,
    }
    if (input.action === 'review-join')
      return handleReviewJoin(state, crossDatabaseUserVerified)
    if (
      input.action === 'set-role' ||
      input.action === 'set-premium' ||
      input.action === 'set-onboarding-status'
    )
      return handleMembershipSettings(state)
    if (input.action === 'remove-member') return handleRemoveMember(state)
    return forbidden(400, 'Unsupported App membership action.')
  })
}

export async function mutateRuntimeAppMembership(
  context: MutationContext
): Promise<AppMembershipMutationResult> {
  const sameDatabase =
    String(context.appDatabaseId || '').trim() ===
    String(context.identityDatabaseId || context.appDatabaseId || '').trim()
  const requiredUserId = requiredIdentityUserId(context.input, context.actorUid)
  let crossDatabaseUserVerified = false
  if (!sameDatabase && requiredUserId) {
    const snapshot = await getRuntimeIdentityFirestore(
      context.identityDatabaseId
    )
      .collection('users')
      .doc(requiredUserId)
      .get()
    if (!snapshot.exists)
      forbidden(409, 'The public User record does not exist.')
    crossDatabaseUserVerified = true
  }
  return mutateInTransaction(context, crossDatabaseUserVerified)
}
