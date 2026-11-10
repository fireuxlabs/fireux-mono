import { createHash } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  readKitchenMutationActor,
  requireKitchenRecordMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import { serverKitchenMenuUploadsTarget } from '../../../kitchen/server/mutation-targets'
import {
  menuSourceFileEntries,
  menuSourceFileIdentity,
} from '../../utils/records/file-identity'
import { readProtectedMenuFile } from '../document/protected-file'

export async function readKitchenMenuSourceFile(
  event: H3Event,
  input: {
    kitchenId: string
    sourceId: string
    fileId: string
    expectedRevision: string
  }
) {
  const actor = await readKitchenMutationActor(event)
  const kitchenId = requireFirestoreDocumentId(input.kitchenId, 'Kitchen id')
  const sourceId = requireFirestoreDocumentId(input.sourceId, 'Menu source id')
  const fileId = requireFirestoreDocumentId(input.fileId, 'Source file id')
  return readProtectedMenuFile({
    expectedRevision: input.expectedRevision,
    resolve: () =>
      runGuardedServerTransaction({ kind: 'runtime' }, async (tx) => {
        const authority = await requireKitchenRecordMutationAuthority(
          tx,
          actor,
          kitchenId
        )
        const source = await tx.read(
          serverKitchenMenuUploadsTarget(kitchenId),
          sourceId
        )
        const files = menuSourceFileEntries(source.data).filter(
          (file) => file.id === fileId
        )
        if (!source.exists || files.length !== 1)
          throw createError({
            statusCode: 404,
            statusMessage: 'This source file is unavailable.',
          })
        const file = files[0]!
        return {
          kitchenId,
          sourceId,
          fileId,
          kitchen: authority.rootData,
          document: {
            url: file.file_url,
            name: file.file_name,
            type: file.file_type,
            storage_path: file.storage_path,
          },
          revision: createHash('sha256')
            .update(menuSourceFileIdentity(source.data, fileId))
            .digest('hex'),
        }
      }),
  })
}
