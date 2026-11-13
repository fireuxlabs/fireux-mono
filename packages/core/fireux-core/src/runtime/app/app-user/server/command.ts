import type { AppMembershipMutationResult } from '../contracts/membership'
import { APP_MUTATION_TARGETS } from '../../server/mutation-targets'
import { serverAppUsersTarget } from './mutation-targets'
import { USER_MUTATION_TARGETS } from '../../../user/server/mutation-targets'
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
} from './command-contract'
import { handleRemoveMember } from './remove'
import { handleMembershipSettings } from './settings'
import { reconcileUserAppReference } from './user-reference'

async function mutateInTransaction(
  context: MutationContext,
  crossDatabaseUserVerified: boolean
): Promise<TransactionOutcome> {
  const { actorUid, appId, developerUid, input } = context
  const apps = APP_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(appId)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    const app = await mutations.read(apps, appId)
    if (!app.exists) forbidden(409, 'The runtime App record does not exist.')
    const actorMembershipSnapshot = await mutations.read(memberships, actorUid)
    const actorMembership = actorMembershipSnapshot.data

    if (input.action === 'ensure-self') {
      if (!crossDatabaseUserVerified) {
        const user = await mutations.read(
          USER_MUTATION_TARGETS.runtimeUsers,
          actorUid
        )
        if (!user.exists)
          forbidden(409, 'The public User record does not exist.')
      }
      if (actorMembershipSnapshot.exists) {
        requireCanonicalMembership(actorMembership ?? {})
        return {
          ok: true,
          action: input.action,
          appId,
          userId: actorUid,
          created: false,
          role: roleFrom(actorMembership) ?? 'user',
        }
      }
      mutations.create(
        memberships,
        actorUid,
        initialMembership(actorUid, 'user')
      )
      mutations.update(apps, appId, appGovernancePatch(actorUid))
      return {
        ok: true,
        action: input.action,
        appId,
        userId: actorUid,
        created: true,
        role: 'user',
      }
    }

    if (input.action === 'bootstrap-admin') {
      if (!developerUid || actorUid !== developerUid)
        forbidden(403, 'Only the configured developer can bootstrap this App.')
      if (!crossDatabaseUserVerified) {
        const user = await mutations.read(
          USER_MUTATION_TARGETS.runtimeUsers,
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

    const state = {
      context,
      mutations,
      actorMembershipExists: actorMembershipSnapshot.exists,
      actorMembership,
    }
    if (
      input.action === 'set-role' ||
      input.action === 'set-subscription' ||
      input.action === 'set-self-subscription'
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
  const result = await mutateInTransaction(context, crossDatabaseUserVerified)
  await reconcileUserAppReference({
    appId: context.appId,
    userId: result.userId,
    appDatabaseId: context.appDatabaseId,
    identityDatabaseId: context.identityDatabaseId,
  })
  return result
}
