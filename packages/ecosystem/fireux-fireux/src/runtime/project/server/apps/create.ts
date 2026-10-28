import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { FIREUX_MUTATION_TARGETS, fireuxAppUsersTarget } from '../platform-targets'
import {
  stamp,
  initialMembership,
} from 'fireux-core/runtime/app/server/app-user/command-contract'
import { reconcileUserAppReference } from 'fireux-core/runtime/app/server/app-user/user-reference'
import { reconcileAppEcosystemReference } from 'fireux-core/runtime/app/server/relationships/ecosystem-reference'
import {
  requireProjectOperator,
  requireProjectOperatorInTransaction,
} from '../authority'

export function projectAppInput(value: unknown) {
  const input =
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {}
  if (
    Object.keys(input).some(
      (key) =>
        ![
          'id',
          'name',
          'description',
          'context',
          'ecosystem_id',
          'role',
        ].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported App creation field.',
    })
  const id = String(input.id ?? '').trim()
  const name = String(input.name ?? '').trim()
  const description = String(input.description ?? '').trim()
  const ecosystemId = String(input.ecosystem_id ?? '').trim()
  if (
    input.context !== undefined &&
    (typeof input.context !== 'string' || input.context.length > 32000)
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'App context must be text up to 32,000 characters.',
    })
  const context = typeof input.context === 'string' ? input.context.trim() : ''
  const role = input.role
  if (
    !/^[a-z0-9][a-z0-9-]{2,62}$/.test(id) ||
    !name ||
    name.length > 120 ||
    description.length > 2000 ||
    !ecosystemId ||
    !['tenant', 'standalone'].includes(String(role))
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Add a valid App id, name, Ecosystem and role.',
    })
  return {
    id,
    name,
    description,
    context,
    ecosystemId,
    role: role as 'tenant' | 'standalone',
  }
}

/** Save an inactive App definition; infrastructure and deployment are separate. */
export async function createProjectApp(
  event: H3Event,
  project: unknown,
  value: unknown
) {
  const actor = await requireProjectOperator(event, project)
  const { uid, projectId } = actor
  const input = projectAppInput(value)
  const config = useFireUXConfig(event)
  if (input.ecosystemId !== config.ecosystemId)
    throw createError({
      statusCode: 409,
      statusMessage:
        'Creation is currently supported in this FireUX Ecosystem only.',
    })
  const targets = FIREUX_MUTATION_TARGETS
  const memberships = fireuxAppUsersTarget(input.id)
  await runGuardedServerTransaction(
    { kind: 'named', databaseId: 'fireux' },
    async (transaction) => {
      await requireProjectOperatorInTransaction(transaction, actor)
      const ecosystem = await transaction.read(
        targets.fireuxEcosystems,
        input.ecosystemId
      )
      const app = await transaction.read(targets.fireuxApps, input.id)
      const membership = await transaction.read(memberships, uid)
      if (!ecosystem.exists || ecosystem.data?.project_id !== projectId)
        throw createError({
          statusCode: 403,
          statusMessage: 'The Ecosystem does not belong to this Project.',
        })
      if (app.exists) {
        const data = app.data
        if (
          data?.created?.by === uid &&
          data?.ecosystem_id === input.ecosystemId &&
          data?.name === input.name &&
          data?.description === input.description &&
          (data?.context || '') === input.context &&
          data?.role === input.role &&
          membership.data?.role === 'admin'
        )
          return
        throw createError({
          statusCode: 409,
          statusMessage: 'That App id is already in use.',
        })
      }
      if (membership.exists)
        throw createError({
          statusCode: 409,
          statusMessage: 'An orphaned App membership needs repair.',
        })
      transaction.create(targets.fireuxApps, input.id, {
        ecosystem_id: input.ecosystemId,
        role: input.role,
        status: 'inactive',
        name: input.name,
        description: input.description,
        context: input.context,
        self_join_enabled: false,
        created: stamp(uid),
        updated: stamp(uid),
      })
      transaction.create(memberships, uid, initialMembership(uid, 'admin'))
    }
  )
  await reconcileAppEcosystemReference({
    appId: input.id,
    appDatabaseId: 'fireux',
    identityDatabaseId: 'fireux',
  })
  await reconcileUserAppReference({
    appId: input.id,
    userId: uid,
    appDatabaseId: 'fireux',
    identityDatabaseId: 'fireux',
  })
  return { ok: true as const, app_id: input.id }
}
