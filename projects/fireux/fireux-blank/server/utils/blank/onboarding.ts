import {
  createMembershipAccess,
  readMembershipAccessIds,
} from 'fireux-core/runtime/app/utils/membership-access'
import { serverBlankAccessTarget } from '../../../app/utils/blank-access'
import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { resolveFireuxEntityManagementForApp } from 'fireux-core/runtime/app/utils/entity-management'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalize-slug'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { blankRootTarget, serverBlankTeamMembersTarget } from './team/targets'
export async function completeBlankOnboarding(event: H3Event, input: unknown) {
  const body = input as { name?: unknown }
  if (
    !body ||
    typeof body !== 'object' ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => key !== 'name')
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid Blank input.',
    })
  const name = String(body.name ?? '').trim() || 'Blank target'
  if (name.length > 120)
    throw createError({
      statusCode: 400,
      statusMessage: 'Blank name is too long.',
    })
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  const appId = requireFirestoreDocumentId(config.appId, 'App id')
  const members = serverAppUsersTarget(appId)
  const grants = serverBlankAccessTarget(appId)
  const id = randomUUID()
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
    const subscription = member.data?.subscription
    if (!isAppUserSubscription(subscription))
      throw createError({
        statusCode: 409,
        statusMessage: 'Invalid subscription.',
      })
    const ids = readMembershipAccessIds(accessRecord.data, member.data)
    if (
      !hasAppSubscriptionCapacity(
        config.subscriptionCapacity,
        'blank',
        subscription,
        ids.length
      )
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'Blank subscription capacity reached.',
      })
    tx.create(blankRootTarget, id, {
      name,
      slug: normalizeSlug(`${name}-${id.slice(0, 6)}`),
      status: 'active',
      management: resolveFireuxEntityManagementForApp(
        config.role,
        appId,
        config.ecosystem
      ),
      created: serverAuditStamp({ by: uid, appId }),
      updated: serverAuditStamp({ by: uid }),
    })
    tx.create(serverBlankTeamMembersTarget(id), uid, {
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
