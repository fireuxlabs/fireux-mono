import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import {
  runGuardedServerTransaction,
  type GuardedServerTransaction,
} from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import {
  downloadStorageFile,
  deleteStorageFileIfExists,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import {
  readKitchenMutationActor,
  requireKitchenMutationAuthority,
} from '../../../kitchen/server/core/mutation-authority'
import {
  serverKitchenMenusTarget,
  serverKitchenMenuUploadsTarget,
} from '../../../kitchen/server/mutation-targets'
import { normalizeMenuCreateInput } from '../../utils/records/create-input'
import { stageCreateKitchenMenu } from '../records/create'
import { menuNameAndSlug } from '../name'
import { saveKitchenMenuUploadFiles } from './uploads'

/** Turn one saved PDF/photo into an ordinary draft Menu, without extraction. */
export async function createKitchenMenuDocumentFromSource(
  event: H3Event,
  input: unknown
) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid document Menu input.',
    })
  const value = input as Record<string, unknown>
  if (
    Object.keys(value).some(
      (key) => !['kitchenId', 'sourceId', 'name'].includes(key)
    )
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Unsupported document Menu field.',
    })
  const kitchenId = requireFirestoreDocumentId(value.kitchenId, 'Kitchen id')
  const sourceId = requireFirestoreDocumentId(value.sourceId, 'Source id')
  const { name, slug } = menuNameAndSlug(event, value.name)
  const actor = await readKitchenMutationActor(event)
  const sources = serverKitchenMenuUploadsTarget(kitchenId)
  const menus = serverKitchenMenusTarget(kitchenId)
  const inspect = async (tx: GuardedServerTransaction) => {
    await requireKitchenMutationAuthority(tx, actor, kitchenId)
    const source = await tx.read(sources, sourceId)
    if (!source.exists)
      throw createError({
        statusCode: 404,
        statusMessage: 'Menu source not found.',
      })
    const menu = await tx.read(menus, sourceId)
    if (source.data?.menu_id || menu.exists) {
      if (
        source.data?.menu_id !== sourceId ||
        !menu.exists ||
        menu.data?.format !== 'document'
      )
        throw createError({
          statusCode: 409,
          statusMessage:
            'This source already belongs to another Menu preparation.',
        })
      return {
        existing: {
          created: false,
          id: sourceId,
          kitchenId,
          slug: String(menu.data?.slug || ''),
        },
      }
    }
    const files = source.data?.files
    if (
      !Array.isArray(files) ||
      files.length !== 1 ||
      !['application/pdf', 'image/jpeg', 'image/png', 'image/webp'].includes(
        files[0]?.file_type
      )
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'Choose one PDF or image to use as a document Menu.',
      })
    const file = files[0]
    if (
      typeof file.storage_path !== 'string' ||
      !file.storage_path.startsWith(
        `kitchens/${kitchenId}/menu-uploads/${sourceId}/source/`
      )
    )
      throw createError({
        statusCode: 409,
        statusMessage: 'The saved file does not belong to this Menu source.',
      })
    return {
      file: {
        path: file.storage_path,
        name: String(file.file_name),
        type: String(file.file_type),
      },
      fingerprint: source.data?.input_fingerprint,
    }
  }
  const before = await runGuardedServerTransaction({ kind: 'runtime' }, inspect)
  if (before.existing) return before.existing
  const { buffer } = await downloadStorageFile({ objectPath: before.file.path })
  // The attachment has its own immutable revision; replacing an import source cannot break it.
  const [file] = await saveKitchenMenuUploadFiles({
    appId: actor.runtimeAppId,
    kitchenId,
    uploadId: randomUUID(),
    replaceExisting: false,
    files: [
      {
        data: buffer,
        fileName: before.file.name,
        contentType: before.file.type,
      },
    ],
  })
  if (!file)
    throw createError({
      statusCode: 502,
      statusMessage: 'The Menu document was not saved.',
    })
  let attached = false
  try {
    const result = await runGuardedServerTransaction(
      { kind: 'runtime' },
      async (tx) => {
        const current = await inspect(tx)
        if (current.existing) return current.existing
        if (
          current.fingerprint !== before.fingerprint ||
          JSON.stringify(current.file) !== JSON.stringify(before.file)
        )
          throw createError({
            statusCode: 409,
            statusMessage:
              'The source changed. Reload before preparing the document.',
          })
        const created = await stageCreateKitchenMenu(tx, actor, {
          kitchenId,
          menuId: sourceId,
          name,
          slug,
          value: normalizeMenuCreateInput({
            name,
            format: 'document',
            doc: {
              url: file.fileUrl,
              name: file.fileName,
              type: file.contentType,
              storage_path: file.objectPath,
            },
          }),
        })
        tx.update(sources, sourceId, {
          menu_id: sourceId,
          updated: serverAuditStamp({
            by: actor.uid,
            appId: actor.runtimeAppId,
          }),
        })
        return created
      }
    )
    attached = result.created
    return result
  } finally {
    if (!attached) {
      // A lost commit response must not delete an attachment that was saved.
      // If readback also fails, retain the revision for a safe retry.
      const stored = await runGuardedServerTransaction(
        { kind: 'runtime' },
        (tx) => tx.read(menus, sourceId)
      ).catch(() => null)
      if (stored && stored.data?.doc?.storage_path !== file.objectPath)
        await deleteStorageFileIfExists({ objectPath: file.objectPath })
    }
  }
}
