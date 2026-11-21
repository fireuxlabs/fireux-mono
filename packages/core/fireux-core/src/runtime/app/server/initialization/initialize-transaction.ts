import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type { FireUXConfig } from '../../composables/config/FireUXConfig'
import { APP_MUTATION_TARGETS } from '../mutation-targets'
import { serverAppUsersTarget } from '../membership/mutation-targets'
import { USER_MUTATION_TARGETS } from '../../../user/server/mutation-targets'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import {
  countTransactionAdmins,
  initialMembership,
  isAdminMembership,
  requireCanonicalMembership,
  stamp,
} from '../membership/command-contract'

function conflict(statusMessage: string): never {
  throw createError({ statusCode: 409, statusMessage })
}

function appPayload(
  config: Readonly<FireUXConfig>,
  uid: string,
  context: string
): DocumentData {
  const now = FieldValue.serverTimestamp()
  return {
    ...(context ? { context } : {}),
    ecosystem_id: config.ecosystemId,
    role: config.role,
    status: 'active',
    name: config.appName,
    short_name: config.appShortName,
    created: { at: now, by: uid },
    updated: { at: now, by: uid },
  }
}

export function assertExistingAppMatchesRuntime(
  data: Record<string, unknown>,
  config: Readonly<FireUXConfig>
) {
  const checks = [
    ['ecosystem_id', config.ecosystemId],
    ['role', config.role],
  ] as const

  for (const [field, expected] of checks) {
    if (String(data[field] || '').trim() !== expected) {
      conflict(`The existing App does not match runtime ${field}.`)
    }
  }
}

export function initializeAppWithAdministrator(
  uid: string,
  config: Readonly<FireUXConfig>,
  context: string,
  sameDatabase: boolean
) {
  const apps = APP_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(config.appId)

  return runGuardedServerTransaction({ kind: 'runtime' }, async (mutations) => {
    if (sameDatabase) {
      const user = await mutations.read(USER_MUTATION_TARGETS.runtimeUsers, uid)
      if (!user.exists) conflict('The User record does not exist.')
    }

    const app = await mutations.read<Record<string, unknown>>(
      apps,
      config.appId
    )
    const membership = await mutations.read<Record<string, unknown>>(
      memberships,
      uid
    )

    if (!app.exists && membership.exists) {
      conflict('An App membership exists without its canonical App record.')
    }

    if (app.exists) {
      assertExistingAppMatchesRuntime(app.data ?? {}, config)
    }

    const needsAdministrator = !isAdminMembership(membership.data)
    if (needsAdministrator) {
      const adminCount = await countTransactionAdmins(mutations, config.appId)
      if (adminCount > 0) {
        conflict('This App already has an administrator.')
      }
    }

    if (!app.exists) {
      mutations.create(apps, config.appId, appPayload(config, uid, context))
    }

    if (!membership.exists) {
      mutations.create(memberships, uid, initialMembership(uid, 'admin'))
    } else if (needsAdministrator) {
      requireCanonicalMembership(membership.data ?? {})
      mutations.update(memberships, uid, {
        role: 'admin',
        updated: stamp(uid),
      })
    }

    if (app.exists && needsAdministrator) {
      mutations.update(apps, config.appId, { updated: stamp(uid) })
    }

    return {
      ok: true as const,
      appId: config.appId,
      userId: uid,
      appCreated: !app.exists,
      membershipCreated: !membership.exists,
      membershipUpdated: membership.exists && needsAdministrator,
    }
  })
}
