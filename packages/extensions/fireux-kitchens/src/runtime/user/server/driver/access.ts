import { serverKitchenAccessTarget } from '../../../kitchen/server/core/access'
import { readKitchenAccessIds } from '../../../kitchen/utils/kitchen-access'
import { createError } from 'h3'
import { FieldValue } from 'firebase-admin/firestore'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { APP_MUTATION_TARGETS, serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { KITCHEN_MUTATION_TARGETS } from '../../../kitchen/server/mutation-targets'
import { serverUserProfileAppStateTarget, serverUserProfileTarget } from 'fireux-core/runtime/user/server/mutation-targets'
import { planDriverKitchenLinks } from '../../utils/driver/kitchen-links'
import {
  type DriverKitchenAccessInput,
  type DriverKitchenAccessResult,
} from '../../models/driver/kitchen-access.ts'

type DriverKitchenAccessContext = {
  actorUid: string
  appId: string
  databaseId: string
  input: DriverKitchenAccessInput
}

function fail(statusCode: number, statusMessage: string): never {
  throw createError({ statusCode, statusMessage })
}

export async function mutateDriverKitchenAccess(
  context: DriverKitchenAccessContext
): Promise<DriverKitchenAccessResult> {
  const { actorUid, appId, input } = context
  void context.databaseId
  const memberships = serverAppUsersTarget(appId)

  const kitchenData = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      const [
        appSnapshot,
        actorMembershipSnapshot,
        targetMembershipSnapshot,
        kitchenSnapshot,
        actorKitchenAccess,
      ] = await Promise.all([
        mutations.read(APP_MUTATION_TARGETS.runtimeApps, appId),
        mutations.read(memberships, actorUid),
        mutations.read(memberships, input.driver_id),
        mutations.read(KITCHEN_MUTATION_TARGETS.kitchens, input.kitchen_id),
        mutations.read(serverKitchenAccessTarget(), actorUid),
      ])

      if (!appSnapshot.exists)
        fail(409, 'The runtime App record does not exist.')
      if (!kitchenSnapshot.exists) fail(404, 'The Kitchen does not exist.')

      const actorRole = String(actorMembershipSnapshot.data?.role ?? '')
        .trim()
        .slice(0, 20)
      if (
        !actorMembershipSnapshot.exists ||
        (actorRole !== 'admin' && actorRole !== 'user' && actorRole !== 'dev')
      ) {
        fail(403, 'App membership is required.')
      }
      if (
        !readKitchenAccessIds(
          actorKitchenAccess.data,
          actorMembershipSnapshot.data,
          appId
        ).includes(input.kitchen_id)
      )
        fail(403, 'Kitchen association is required.')

      const targetRole = String(targetMembershipSnapshot.data?.role ?? '')
        .trim()
        .slice(0, 20)
      if (
        !targetMembershipSnapshot.exists ||
        (targetRole !== 'admin' && targetRole !== 'user')
      ) {
        fail(409, 'The target Driver is not an App member.')
      }
      return kitchenSnapshot.data ?? {}
    }
  )

  const profiles = serverUserProfileTarget(
    input.driver_id,
    'driver',
    'identity'
  )
  const appStates = serverUserProfileAppStateTarget(
    input.driver_id,
    'driver',
    appId,
    'identity'
  )
  return runGuardedServerTransaction(
    { kind: 'identity' },
    async (mutations) => {
      const [profileSnapshot, driverSnapshot] = await Promise.all([
        mutations.read(profiles, 'driver'),
        mutations.read(appStates, appId),
      ])
      if (!profileSnapshot.exists || !driverSnapshot.exists) {
        fail(409, 'The target Driver profile is not ready for this App.')
      }

      const driver = driverSnapshot.data ?? {}
      const change = planDriverKitchenLinks(driver, appId, input, kitchenData)
      if (change.ok === false) {
        fail(
          409,
          change.reason === 'exceeded'
            ? 'The Driver Kitchen link limit has been exceeded.'
            : 'The Driver Kitchen link limit has been reached.'
        )
      }
      const { links: nextLinks, activeKitchenIds, changed } = change

      if (changed) {
        mutations.update(appStates, appId, {
          kitchen_links: nextLinks,
          active_kitchen_ids: activeKitchenIds,
          updated: {
            at: FieldValue.serverTimestamp(),
            by: actorUid,
          },
        })
      }

      return {
        ok: true,
        action: input.action,
        app_id: appId,
        driver_id: input.driver_id,
        kitchen_id: input.kitchen_id,
        changed,
        active_kitchen_ids: activeKitchenIds,
      }
    }
  )
}
