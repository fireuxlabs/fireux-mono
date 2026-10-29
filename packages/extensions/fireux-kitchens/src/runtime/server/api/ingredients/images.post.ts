import { createError, defineEventHandler } from 'h3'
import { uploadProtectedImage } from 'fireux-core/runtime/server/utils/uploads/image'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { serverAppUsersTarget } from 'fireux-core/runtime/app/server/mutation-targets'
import {
  curatorContext,
  assertCurator,
} from '../../../ingredient/server/curation-authority'

export default defineEventHandler((event) =>
  uploadProtectedImage(event, async (path) => {
    if (!/^ingredients\/[a-z0-9-]+\/image_url$/.test(path))
      throw createError({
        statusCode: 400,
        statusMessage: 'Ingredient image target is invalid.',
      })
    const actor = await curatorContext(event)
    await runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
      const member = await tx.read(serverAppUsersTarget(actor.appId), actor.uid)
      assertCurator(member.data, actor.isDeveloper)
    })
  })
)
