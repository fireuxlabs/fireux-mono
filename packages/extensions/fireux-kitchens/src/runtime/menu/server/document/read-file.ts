import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readMenuDocumentActor,
  requireMenuDocumentAuthority,
} from './authority'
import { menuDocumentRevision } from './read'
import { readProtectedMenuFile } from './protected-file'

export async function readKitchenMenuDocumentFile(
  event: H3Event,
  input: {
    kitchenId: string
    menuId: string
    expectedRevision: string
    claimSecret?: string
  }
) {
  const actor = await readMenuDocumentActor(event)
  return readProtectedMenuFile({
    expectedRevision: input.expectedRevision,
    resolve: () =>
      runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        const target = await requireMenuDocumentAuthority(
          tx,
          {
            ...actor,
            kitchenId: input.kitchenId,
            menuId: input.menuId,
            claimSecret: input.claimSecret,
          },
          { allowArchived: true, exactMenu: true }
        )
        if (target.menu.data.schedule === 'daily' || !target.menu.data.doc)
          throw createError({
            statusCode: 404,
            statusMessage: 'This Menu has no document preview.',
          })
        return {
          kitchenId: target.kitchenId,
          kitchen: target.kitchen,
          document: target.menu.data.doc,
          revision: menuDocumentRevision(target.menu.data),
        }
      }),
  })
}
