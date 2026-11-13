import { normalizeBusiness } from '../utils/normalize-business'
import { resolveWorkspaceCanCreate } from 'fireux-core/runtime/workspace/utils/policy'
import { businessProfile } from './profile'
import { PLACE_MUTATION_TARGETS } from 'fireux-places/runtime/place/server/mutation-targets'
import {
  createMembershipAccess,
  readMembershipAccessIds,
} from 'fireux-core/runtime/app/app-user/utils/membership-access'
import { serverBusinessAccessTarget } from './mutation-targets'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { readAppUserSubscription } from 'fireux-core/runtime/app/app-user/utils/validation'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import {
  resolveFireuxEntityManagementForApp,
  resolveFireuxEntityManagementAppId,
} from 'fireux-core/runtime/app/utils/entity-management'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/app-user/server/mutation-targets'
import {
  BUSINESS_MUTATION_TARGETS,
  serverBusinessTeamTarget,
} from './mutation-targets'
export async function completeBusinessOnboarding(
  event: H3Event,
  input: unknown
) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Business input.',
    })
  const { id: requestedId, ...fields } = input as Record<string, unknown>
  const profile = businessProfile(fields)
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(config.appId, 'App id')
  if (
    !resolveWorkspaceCanCreate(config.role, config.workspaceConfig, 'business')
  )
    throw createError({
      statusCode: 403,
      statusMessage: 'Business creation is disabled in this App.',
    })
  const members = serverAppUsersTarget(appId)
  const grants = serverBusinessAccessTarget(appId)
  const id = requireFirestoreDocumentId(requestedId, 'Business id')
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const [member, accessRecord] = await Promise.all([
      tx.read(members, uid),
      tx.read(grants, uid),
    ])
    if (
      !member.exists ||
      !['admin', 'user', 'dev'].includes(String(member.data?.role))
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Current App membership is required.',
      })
    const subscription = readAppUserSubscription(member.data?.subscription)
    if (!subscription)
      throw createError({
        statusCode: 409,
        statusMessage: 'Invalid subscription.',
      })
    const ids = readMembershipAccessIds(accessRecord.data, member.data)
    const existing = await tx.read(BUSINESS_MUTATION_TARGETS.businesses, id)
    if (existing.exists) {
      if (!ids.includes(id))
        throw createError({
          statusCode: 409,
          statusMessage: 'Business id is already in use.',
        })
      const business = normalizeBusiness(id, existing.data)
      if (
        !business ||
        (business.management.mode !== 'root' &&
          resolveFireuxEntityManagementAppId(
            business.management,
            config.ecosystem
          ) !== appId)
      )
        throw createError({
          statusCode: 409,
          statusMessage:
            'Existing Business is invalid or belongs to another App scope.',
        })
      return { ok: true as const, id, createdRoot: false }
    }
    if (
      !hasAppSubscriptionCapacity(
        config.subscriptionCapacity,
        'business',
        subscription,
        ids.length
      )
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Business subscription capacity reached.',
      })
    for (const placeId of profile.place_ids) {
      const place = await tx.read(PLACE_MUTATION_TARGETS.places, placeId)
      if (!place.exists)
        throw createError({
          statusCode: 400,
          statusMessage: 'Linked Place does not exist.',
        })
    }
    tx.create(BUSINESS_MUTATION_TARGETS.businesses, id, {
      ...profile,
      management: resolveFireuxEntityManagementForApp(
        config.role,
        appId,
        config.ecosystem
      ),
      created: serverAuditStamp({ by: uid, appId }),
      updated: serverAuditStamp({ by: uid }),
    })
    tx.create(serverBusinessTeamTarget(id), uid, {
      name: '',
      user_id: uid,
      role_ids: [],
    })
    const nextAccess = createMembershipAccess([...ids, id], member.data)
    if (accessRecord.exists) tx.update(grants, uid, nextAccess)
    else tx.create(grants, uid, nextAccess)
    return { ok: true as const, id, createdRoot: true as const }
  })
}
