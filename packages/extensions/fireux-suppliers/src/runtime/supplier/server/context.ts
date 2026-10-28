import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { SUPPLIER_MUTATION_TARGETS } from './mutation-targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import {
  readContextRequest,
  contextChange,
} from 'fireux-core/runtime/server/utils/records/context'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readSupplierMutationActor,
  requireSupplierMutationAuthority,
} from './team/authority'

export async function supplierContext(
  event: H3Event,
  input: unknown,
  write = false
) {
  const value = readContextRequest(input, ['supplierId'], write)
  const id = requireFirestoreDocumentId(value.supplierId, 'Supplier id')
  const actor = await readSupplierMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { rootData } = await requireSupplierMutationAuthority(tx, actor, id)
    const current = readRecordString(rootData, 'context')
    if (!write) return { context: current }
    const context = contextChange(value, current)
    tx.update(SUPPLIER_MUTATION_TARGETS.suppliers, id, {
      context,
      updated: serverAuditStamp({ by: actor.uid }),
    })
    return { context }
  })
}
