import { readFireuxEntityManagement, resolveFireuxEntityManagementAppId } from 'fireux-core/runtime/app/utils/entity-management'
import type { H3Event } from 'h3'
import { readMembershipAccessIds } from 'fireux-core/runtime/app/utils/membership-access'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { createError } from 'h3'
import { readBusinessMutationActor } from './team/authority'
import { BUSINESS_MUTATION_TARGETS, serverBusinessAccessTarget } from './mutation-targets'
import { normalizeBusiness } from '../utils/normalize-business'
export async function readBusinessWorkspace(event: H3Event) {
  const actor = await readBusinessMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const [member, access] = await Promise.all([
      tx.read(serverAppUsersTarget(actor.runtimeAppId), actor.uid),
      tx.read(serverBusinessAccessTarget(actor.runtimeAppId), actor.uid),
    ])
    if (!member.exists || !['admin', 'user', 'dev'].includes(String(member.data?.role)))
      throw createError({ statusCode: 403, statusMessage: 'Current App membership is required.' })
    const ids = readMembershipAccessIds(access.data, member.data)
    const roots = await tx.readMany(BUSINESS_MUTATION_TARGETS.businesses, ids)
    return { accessCount: ids.length, businesses: roots.flatMap((root) => {
      const business = root.exists ? normalizeBusiness(root.id, root.data) : null
      if (root.exists && !business) throw createError({ statusCode: 409, statusMessage: 'Stored Business is invalid.' })
      if (!business) return []
      const management = readFireuxEntityManagement(business.management)!
      if (management.mode !== 'root' && resolveFireuxEntityManagementAppId(management, actor.ecosystem) !== actor.runtimeAppId)
        throw createError({ statusCode: 409, statusMessage: 'Business belongs to another App scope.' })
      return [business]
    }) }
  })
}
