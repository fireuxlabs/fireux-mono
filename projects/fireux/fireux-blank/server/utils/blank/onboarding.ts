import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from 'fireux-core/runtime/app/composables/config/FireUXConfig'
import { isAppUserSubscription } from 'fireux-core/runtime/app/models/app-user.model'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
import { resolveFireuxEntityManagementForApp } from 'fireux-core/runtime/utils/entity-management'
import { requireFirebaseBearerUser } from 'fireux-core/runtime/server/utils/auth/bearer'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { normalizeSlug } from 'fireux-core/runtime/utils/slug/normalizeSlug'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
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
  const id = randomUUID()
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const member = await tx.read(members, uid)
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
    const ids = Array.isArray(member.data?.blanks) ? member.data.blanks : []
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
    tx.update(members, uid, {
      blanks: [...ids, id],
      primary_blank: member.data?.primary_blank || id,
    })
    return { ok: true as const, id, createdRoot: true as const }
  })
}
