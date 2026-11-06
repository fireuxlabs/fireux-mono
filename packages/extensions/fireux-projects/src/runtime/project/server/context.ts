import type { H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readContextRequest,
  contextChange,
} from 'fireux-core/runtime/server/utils/records/context'
import { readRecordString } from 'fireux-core/runtime/server/utils/records/read'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  requireProjectOperator,
  requireProjectOperatorInTransaction,
} from './authority'
import { fireuxProjectsTarget } from './targets'

export async function projectContext(
  event: H3Event,
  input: unknown,
  write = false
) {
  const value = readContextRequest(input, ['projectId'], write)
  const actor = await requireProjectOperator(event, value.projectId)
  return runGuardedServerTransaction(
    fireuxProjectsTarget.database,
    async (tx) => {
      await requireProjectOperatorInTransaction(tx, actor)
      const root = await tx.read(fireuxProjectsTarget, actor.projectId)
      const current = readRecordString(root.data || {}, 'context')
      if (!write) return { context: current }
      const context = contextChange(value, current)
      tx.update(fireuxProjectsTarget, actor.projectId, {
        context,
        updated: serverAuditStamp({ by: actor.uid }),
      })
      return { context }
    }
  )
}
