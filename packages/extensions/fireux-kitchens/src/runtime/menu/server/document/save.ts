import { randomUUID } from 'node:crypto'
import { createError, type H3Event } from 'h3'
import { runGuardedServerTransaction } from 'fireux-core/runtime/server/utils/firestore-mutations/server-transaction'
import {
  deleteStorageFileIfExists,
  runtimeStorageBucketName,
} from 'fireux-core/runtime/server/utils/uploads/storage'
import { serverAuditStamp } from 'fireux-core/runtime/server/utils/records/stamps'
import { requireFirestoreDocumentId } from 'fireux-core/runtime/server/utils/ids/path'
import { stagePlaceUpdate } from 'fireux-places/runtime/place/server/identity/stage-update'
import { serverKitchenMenusTarget } from '../../../kitchen/server/mutation-targets'
import { normalizeMenuDocument } from '../../utils/menu-metadata'
import {
  saveKitchenMenuUploadFiles,
  type KitchenMenuUploadFile,
} from '../source/uploads'
import { stagePublishKitchenMenu } from '../publication/publish'
import {
  readMenuDocumentActor,
  requireMenuDocumentAuthority,
  assertMenuAcceptsDocument,
} from './authority'
import { menuDocumentRevision, menuDocumentToolProjection } from './read'

/** Workspace attachments and self-service publication share this single file writer. */
export async function saveKitchenDocumentMenu(
  event: H3Event,
  input: {
    kitchenId: string
    menuId: string
    files: KitchenMenuUploadFile[]
    claimSecret?: string
    revision?: string
    publish?: boolean
    venueName?: string
  }
) {
  if (input.files.length !== 1)
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose one PDF or image.',
    })
  const original = input.files[0]!
  const bytes = original.data
  const signatures: Record<string, boolean> = {
    'application/pdf': bytes.subarray(0, 5).toString() === '%PDF-',
    'image/jpeg': bytes[0] === 255 && bytes[1] === 216,
    'image/png': bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    'image/webp':
      bytes.subarray(0, 4).toString() === 'RIFF' &&
      bytes.subarray(8, 12).toString() === 'WEBP',
  }
  if (
    !signatures[original.contentType] ||
    !bytes.length ||
    bytes.length > 10 * 1024 * 1024
  )
    throw createError({
      statusCode: 400,
      statusMessage: 'Choose a PDF, JPG, PNG or WebP up to 10 MB.',
    })
  const actor = await readMenuDocumentActor(event)
  const scope = {
    ...actor,
    kitchenId: requireFirestoreDocumentId(input.kitchenId, 'Kitchen id'),
    menuId: requireFirestoreDocumentId(input.menuId, 'Menu id'),
    claimSecret: input.claimSecret,
  }
  const before = await runGuardedServerTransaction({ kind: 'runtime' }, (tx) =>
    requireMenuDocumentAuthority(tx, scope)
  )
  const revision = menuDocumentRevision(before.menu.data)
  assertMenuAcceptsDocument(before)
  if (input.revision !== undefined && input.revision !== revision)
    throw createError({
      statusCode: 409,
      statusMessage: 'The Menu changed. Reload before replacing its document.',
    })
  const [file] = await saveKitchenMenuUploadFiles({
    appId: actor.appId,
    kitchenId: before.kitchenId,
    uploadId: randomUUID(),
    replaceExisting: false,
    files: input.files,
  })
  if (!file)
    throw createError({
      statusCode: 502,
      statusMessage: 'The Menu document could not be saved.',
    })
  const document = normalizeMenuDocument({
    url: file.fileUrl,
    name: file.fileName,
    type: file.contentType,
    storage_path: file.objectPath,
  })
  const menus = serverKitchenMenusTarget(before.kitchenId)
  let attached = false
  try {
    const result = await runGuardedServerTransaction(
      { kind: 'runtime' },
      async (tx) => {
        const current = await requireMenuDocumentAuthority(tx, scope)
        assertMenuAcceptsDocument(current)
        if (menuDocumentRevision(current.menu.data) !== revision)
          throw createError({
            statusCode: 409,
            statusMessage:
              'The Menu changed during upload. Reload before replacing it.',
          })
        if (input.publish)
          await stagePublishKitchenMenu(tx, { ...scope, document })
        else {
          if (current.guest)
            throw createError({
              statusCode: 403,
              statusMessage: 'Guest documents use the public publishing tool.',
            })
          tx.update(menus, current.menu.id, {
            format: 'document',
            doc: document,
            updated: serverAuditStamp({ by: actor.uid, appId: actor.appId }),
          })
        }
        if (current.guest && !current.menu.data.doc?.url && input.venueName) {
          stagePlaceUpdate(
            tx,
            current.kitchenId,
            { name: input.venueName },
            current.place,
            {
              uid: actor.uid,
              runtimeAppId: actor.appId,
              bucketName: runtimeStorageBucketName(),
            }
          )
        }
        return menuDocumentToolProjection({
          ...current,
          place:
            current.guest && !current.menu.data.doc?.url && input.venueName
              ? { ...current.place, name: input.venueName.trim() }
              : current.place,
          menu: {
            ...current.menu,
            data: {
              ...current.menu.data,
              format: 'document',
              doc: document,
              ...(input.publish ? { status: 'published' } : {}),
            },
          },
        })
      }
    )
    attached = true
    return result
  } finally {
    if (!attached) {
      const stored = await runGuardedServerTransaction(
        { kind: 'runtime' },
        (tx) => tx.read(menus, before.menu.id)
      ).catch(() => null)
      if (stored && stored.data?.doc?.storage_path !== file.objectPath)
        await deleteStorageFileIfExists({ objectPath: file.objectPath })
    }
  }
}
