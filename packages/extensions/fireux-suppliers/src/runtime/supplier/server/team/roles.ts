import type { H3Event } from 'h3'
import { defineFirestoreMutationTarget } from 'fireux-core/runtime/utils/firestore-mutations/target-definition'
import { serverSupplierTeamMembersTarget } from 'fireux-core/runtime/utils/firestore-mutations/targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { teamRolesCommand, type TeamRolePolicy } from 'fireux-core/runtime/workspace/server/team/roles'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from './authority'
const supplierTeamRolePolicy = {
  fixedRoles: [
    { id: 'dev', name: 'Dev' },
    { id: 'operator', name: 'Operator' },
  ],
  fixedRoleRenameMessage: 'Dev and Operator are fixed roles.',
} as const satisfies TeamRolePolicy

export async function supplierRoles(
  event: H3Event,
  input: Record<string, unknown>
) {
  const id = requireFirestoreDocumentId(input.supplierId, 'Supplier id')
  const actor = await readSupplierMutationActor(event)
  const roles = defineFirestoreMutationTarget({
    key: 'suppliers.roles',
    lane: 'server',
    verbs: ['create', 'update'],
    database: { kind: 'runtime' },
    collectionPath: `suppliers/${id}/roles`,
  })
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    await requireSupplierMutationAuthority(tx, actor, id)
    return teamRolesCommand(
      tx,
      roles,
      serverSupplierTeamMembersTarget(id),
      input,
      supplierTeamRolePolicy
    )
  })
}
