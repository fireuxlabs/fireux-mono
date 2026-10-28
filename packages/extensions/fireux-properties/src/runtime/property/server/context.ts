import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { PROPERTY_MUTATION_TARGETS } from './mutation-targets'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import {
  readContextRequest,
  contextChange,
} from 'fireux-core/runtime/server/utils/records/context'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  readPropertyMutationActor,
  requirePropertyMutationAuthority,
} from './team/authority'

export async function propertyContext(
  event: H3Event,
  input: unknown,
  write = false
) {
  const value = readContextRequest(input, ['propertyId'], write)
  const id = requireFirestoreDocumentId(value.propertyId, 'Property id')
  const actor = await readPropertyMutationActor(event)
  return runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
    const { rootData } = await requirePropertyMutationAuthority(tx, actor, id)
    const current = readRecordString(rootData, 'context')
    if (!write) return { context: current }
    const context = contextChange(value, current)
    tx.update(PROPERTY_MUTATION_TARGETS.properties, id, {
      context,
      updated: serverAuditStamp({ by: actor.uid }),
    })
    return { context }
  })
}
