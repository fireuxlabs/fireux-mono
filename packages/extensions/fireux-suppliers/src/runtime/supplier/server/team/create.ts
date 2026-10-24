import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverSupplierTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from './authority'
import { createError } from 'h3'
import {
  createTeamMember,
  resolveTeamMemberInput,
} from 'fireux-core/runtime/workspace/server/team/members'
import { hasAppSubscriptionCapacity } from 'fireux-core/runtime/app/utils/app-subscription-capacity'
export type CreateSupplierTeamMemberInput = {
  supplierId: string
  name: string
  userId?: string
}
export type CreateSupplierTeamMemberResult = {
  ok: true
  memberId: string
  name: string
}
export async function createSupplierTeamMember(
  event: H3Event,
  input: CreateSupplierTeamMemberInput
): Promise<CreateSupplierTeamMemberResult> {
  if (
    Object.keys(input || {}).some(
      (key) => !['supplierId', 'name', 'userId'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported Team member field.',
    })
  const id = requireFirestoreDocumentId(input?.supplierId, 'Supplier id')
  const actor = await readSupplierMutationActor(event)
  const member = await resolveTeamMemberInput(input)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const workspace = await requireSupplierMutationAuthority(tx, actor, id)
    return createTeamMember(tx, serverSupplierTeamMembersTarget(id), member, {
      canAdd: (count) =>
        hasAppSubscriptionCapacity(
          actor.subscriptionCapacity,
          'supplier.team',
          workspace.subscription,
          count
        ),
      limitMessage: `Your ${workspace.subscription} subscription has reached its Team member limit.`,
    })
  })
}
