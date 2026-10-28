import { createError, type H3Event } from 'h3'
import { useFireUXConfig } from '../composables/config/FireUXConfig'
import { requireFirebaseBearerUser } from '../../server/utils/auth/bearer'
import { runGuardedServerTransaction } from '../../server/utils/firestore-mutations/server-transaction'
import {
  readContextRequest,
  contextChange,
} from '../../server/utils/records/context'
import { readRecordString } from '../../server/utils/records/read'
import { serverAuditStamp } from '../../server/utils/records/stamps'
import { APP_MUTATION_TARGETS, serverAppUsersTarget } from './mutation-targets'
/** Only the configured owning App; directory membership grants no remote write. */
export async function appContext(
  event: H3Event,
  input: unknown,
  write = false
) {
  const value = readContextRequest(input, ['appId'], write)
  const { uid } = await requireFirebaseBearerUser(event)
  const config = useFireUXConfig(event)
  if (value.appId !== config.appId)
    throw createError({
      statusCode: 403,
      statusMessage: 'Only the current App context may be managed here.',
    })
  const target = APP_MUTATION_TARGETS.runtimeApps
  return runGuardedServerTransaction(target.database, async (tx) => {
    const [app, membership] = await Promise.all([
      tx.read(target, config.appId),
      tx.read(serverAppUsersTarget(config.appId), uid),
    ])
    if (!app.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'App was not found.',
      })
    if (
      !['admin', 'dev'].includes(String(membership.data?.role)) &&
      !(config.developerId && uid === config.developerId)
    )
      throw createError({
        statusCode: 403,
        statusMessage: 'App admin access is required.',
      })
    const current = readRecordString(app.data || {}, 'context')
    if (!write) return { context: current }
    const context = contextChange(value, current)
    tx.update(target, config.appId, {
      context,
      updated: serverAuditStamp({ by: uid }),
    })
    return { context }
  })
}
