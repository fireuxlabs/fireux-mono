import { Timestamp } from 'firebase-admin/firestore'
import { defineEventHandler, readBody, setResponseHeader } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppConversationsTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import { requireFireuxAppAdmin } from '../../../../utils/require-fireux-app-admin'
import { advanceIgnitionBuild } from '../../../../utils/ignition-build'

export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const { appId, uid } = await requireFireuxAppAdmin(event)
  const body = await readBody(event)
  const target = serverAppConversationsTarget(appId)
  const build = await runGuardedServerTransaction(
    { kind: 'runtime' },
    (mutations) =>
      advanceIgnitionBuild(
        {
          async read(id) {
            const result = await mutations.read(target, id)
            return result.data
          },
          create(id, value) {
            mutations.create(target, id, value)
          },
          update(id, value) {
            mutations.update(target, id, value)
          },
        },
        body,
        { appId, uid, at: Timestamp.now() }
      )
  )
  return { ok: true, build }
})
