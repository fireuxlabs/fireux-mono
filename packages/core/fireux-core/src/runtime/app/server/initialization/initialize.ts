import { createError } from 'h3'
import { FieldValue, type DocumentData } from 'firebase-admin/firestore'
import type { FireUXConfig } from '../../composables/config/FireUXConfig'
import type { AppInitializationResult } from '../../contracts/initialization'
import { APP_MUTATION_TARGETS } from '../mutation-targets'
import { serverAppUsersTarget } from '../../app-user/server/mutation-targets'
import { USER_MUTATION_TARGETS } from '../../../user/server/mutation-targets'
import {
  getRuntimeFirestore,
  getRuntimeIdentityFirestore,
} from '../../../server/utils/getRuntimeFirestore'
import { runGuardedServerTransaction } from '../../../server/utils/firestore-mutations/server-transaction'
import {
  countTransactionAdmins,
  initialMembership,
  isAdminMembership,
  requireCanonicalMembership,
  stamp,
} from '../../app-user/server/command-contract'
import { reconcileUserAppReference } from '../../app-user/server/user-reference'
import { reconcileAppEcosystemReference } from '../relationships/ecosystem-reference'
import { provisionEcosystem } from '../../../ecosystem/server/identity/provision'

type InitializeRuntimeAppInput = {
  uid: string
  config: Readonly<FireUXConfig>
  appDatabaseId: string
  identityDatabaseId: string
  context?: string
  ecosystem: { name: string; description: string }
}

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
    context,
    ecosystem_id: config.ecosystemId,
    role: config.role,
    status: 'active',
    name: config.appName,
    short_name: config.appShortName,
    tagline: '',
    description: '',
    social_links: {
      website: '',
      twitter: '',
      github: '',
      linkedin: '',
      instagram: '',
      facebook: '',
      youtube: '',
      email: '',
    },
    media: {
      thumbnail_url: '',
      logo_url: '',
      wordmark_light_url: '',
      wordmark_dark_url: '',
      cover_url: '',
    },
    created: { at: now, by: uid },
    updated: { at: now, by: uid },
  }
}

function assertExistingAppMatchesRuntime(
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

async function provisionMainAppEcosystem(
  input: InitializeRuntimeAppInput,
  identityUserExists: boolean
) {
  const { uid, config, appDatabaseId, identityDatabaseId } = input
  if (
    config.role !== 'global' ||
    config.projectId !== config.ecosystemId ||
    config.appId !== `${config.ecosystemId}-app`
  )
    return false

  return provisionEcosystem({
    uid,
    identityDatabaseId,
    ecosystemId: config.ecosystemId,
    projectId: config.projectId,
    name: input.ecosystem.name,
    description: input.ecosystem.description,
    checkPrerequisites: async () => {
      if (!identityUserExists) {
        const user = await getRuntimeIdentityFirestore(identityDatabaseId)
          .collection('users')
          .doc(uid)
          .get()
        if (!user.exists) conflict('The User record does not exist.')
      }

      const database = getRuntimeFirestore(appDatabaseId)
      const app = await database.collection('apps').doc(config.appId).get()
      if (app.exists) {
        assertExistingAppMatchesRuntime(app.data() ?? {}, config)
      } else {
        const membership = await database
          .doc(`apps/${config.appId}/users/${uid}`)
          .get()
        if (membership.exists)
          conflict('An App membership exists without its canonical App record.')
      }
    },
  })
}

export async function initializeRuntimeApp(
  input: InitializeRuntimeAppInput
): Promise<AppInitializationResult> {
  const { uid, config } = input
  if (
    input.context !== undefined &&
    (typeof input.context !== 'string' || input.context.length > 32000)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'App context must be text up to 32,000 characters.',
    })
  const context = input.context?.trim() || ''
  const sameDatabase = input.appDatabaseId === input.identityDatabaseId
  let identityUserExists = false

  if (!sameDatabase) {
    const identityUser = await getRuntimeIdentityFirestore(
      input.identityDatabaseId
    )
      .collection('users')
      .doc(uid)
      .get()
    if (!identityUser.exists) conflict('The User record does not exist.')
    identityUserExists = true
  }

  const ecosystemCreated = await provisionMainAppEcosystem(
    input,
    identityUserExists
  )

  const apps = APP_MUTATION_TARGETS.runtimeApps
  const memberships = serverAppUsersTarget(config.appId)

  const result = await runGuardedServerTransaction(
    { kind: 'runtime' },
    async (mutations) => {
      if (sameDatabase) {
        const user = await mutations.read(
          USER_MUTATION_TARGETS.runtimeUsers,
          uid
        )
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

      if (!isAdminMembership(membership.data)) {
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
      } else if (!isAdminMembership(membership.data)) {
        requireCanonicalMembership(membership.data ?? {})
        mutations.update(memberships, uid, {
          role: 'admin',
          updated: stamp(uid),
        })
      }

      if (app.exists && !isAdminMembership(membership.data)) {
        mutations.update(apps, config.appId, { updated: stamp(uid) })
      }

      return {
        ok: true as const,
        appId: config.appId,
        userId: uid,
        appCreated: !app.exists,
        membershipCreated: !membership.exists,
        membershipUpdated:
          membership.exists && !isAdminMembership(membership.data),
      }
    }
  )
  await reconcileUserAppReference({
    appId: config.appId,
    userId: uid,
    appDatabaseId: input.appDatabaseId,
    identityDatabaseId: input.identityDatabaseId,
  })
  await reconcileAppEcosystemReference({
    appId: config.appId,
    appDatabaseId: input.appDatabaseId,
    identityDatabaseId: input.identityDatabaseId,
  })
  return { ...result, ecosystemCreated }
}
